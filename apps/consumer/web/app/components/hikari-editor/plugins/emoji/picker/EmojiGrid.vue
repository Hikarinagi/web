<script setup lang="ts" generic="T extends Emoji">
  import { Button, SimpleGrid, Skeleton } from '@hina-ui/vue'
  import type { Emoji } from '../composables/useUserEmojiCatalog'
  import { EMOJI_PICKER_IMAGE } from './image'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerEmojiGrid' })

  defineProps<{
    emojis: readonly T[]
  }>()

  const emit = defineEmits<{
    (e: 'pick', emoji: T): void
    (e: 'preview', emoji: T, anchor: HTMLElement): void
  }>()

  const LONG_PRESS_MS = 450
  let timer: ReturnType<typeof setTimeout> | null = null
  let previewed = false

  function cancel() {
    if (!timer) return
    clearTimeout(timer)
    timer = null
  }

  function onPressStart(emoji: T, event: PointerEvent) {
    cancel()
    previewed = false
    const anchor = event.currentTarget as HTMLElement
    timer = setTimeout(() => {
      timer = null
      previewed = true
      emit('preview', emoji, anchor)
    }, LONG_PRESS_MS)
  }

  function onPick(emoji: T) {
    cancel()
    if (previewed) {
      previewed = false
      return
    }
    emit('pick', emoji)
  }

  onBeforeUnmount(cancel)
</script>

<template>
  <SimpleGrid min="2.5rem" gap="xs" class="p-1">
    <Button
      v-for="emoji in emojis"
      :key="emoji.id"
      v-tooltip="`:${emoji.name}:`"
      variant="ghost"
      tone="neutral"
      icon-only
      :aria-label="emoji.name"
      class="size-10"
      @pointerdown="(event: PointerEvent) => onPressStart(emoji, event)"
      @pointerup="cancel"
      @pointerleave="cancel"
      @pointercancel="cancel"
      @contextmenu.prevent
      @click="onPick(emoji)"
    >
      <template #icon>
        <HikariImage
          :src="emoji.src?.src"
          :alt="emoji.name"
          :processing="EMOJI_PICKER_IMAGE"
          :draggable="false"
          class="size-8"
          image-class="size-full object-contain"
        >
          <template #skeleton>
            <Skeleton class="size-full rounded-sm" />
          </template>
        </HikariImage>
      </template>
    </Button>
  </SimpleGrid>
</template>

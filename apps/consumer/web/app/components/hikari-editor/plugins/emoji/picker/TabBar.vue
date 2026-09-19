<script setup lang="ts">
  import { Button, Inline, ScrollArea, Skeleton, Text } from '@hina-ui/vue'
  import { Clock } from '@lucide/vue'
  import type { UserCatalogSet } from '../composables/useUserEmojiCatalog'
  import { EMOJI_PICKER_IMAGE } from './image'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerTabBar' })

  defineProps<{
    sets: UserCatalogSet[]
    activeId: string | null
  }>()

  const emit = defineEmits<{ (e: 'select', id: string): void }>()

  const RECENT_ID = 'recent'
</script>

<template>
  <Inline :wrap="false" gap="none" align="center" class="shrink-0 border-line">
    <ScrollArea direction="horizontal" :scrollbar="false" class="min-w-0 flex-1">
      <Inline :wrap="false" gap="xs" align="center" class="w-max">
        <Button
          v-tooltip="{ content: '最近使用', side: 'bottom' }"
          :variant="activeId === RECENT_ID ? 'soft' : 'ghost'"
          :tone="activeId === RECENT_ID ? 'accent' : 'neutral'"
          size="sm"
          icon-only
          aria-label="最近使用"
          @click="emit('select', RECENT_ID)"
        >
          <template #icon><Clock /></template>
        </Button>

        <Button
          v-for="set in sets"
          :key="set.id"
          v-tooltip="{ content: set.name, side: 'bottom' }"
          :variant="activeId === `set-${set.id}` ? 'soft' : 'ghost'"
          :tone="activeId === `set-${set.id}` ? 'accent' : 'neutral'"
          size="sm"
          icon-only
          :aria-label="set.name"
          @click="emit('select', `set-${set.id}`)"
        >
          <template #icon>
            <HikariImage
              v-if="set.emojis[0]?.src"
              :src="set.emojis[0].src.src"
              :alt="set.name"
              :processing="EMOJI_PICKER_IMAGE"
              class="size-5"
              image-class="size-full object-contain"
            >
              <template #skeleton>
                <Skeleton class="size-full rounded-sm" />
              </template>
            </HikariImage>
            <Text v-else as="span" size="xs" tone="muted">{{ set.name.slice(0, 2) }}</Text>
          </template>
        </Button>
      </Inline>
    </ScrollArea>

    <slot name="trailing" />
  </Inline>
</template>

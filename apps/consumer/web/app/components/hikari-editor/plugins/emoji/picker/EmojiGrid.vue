<script setup lang="ts" generic="T extends Emoji">
  import type { Emoji } from '../composables/useUserEmojiCatalog'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerEmojiGrid' })

  defineProps<{
    emojis: readonly T[]
  }>()

  const emit = defineEmits<{ (e: 'pick', emoji: T): void }>()
</script>

<template>
  <div class="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1 p-1">
    <Button
      v-for="emoji in emojis"
      :key="emoji.id"
      v-tooltip.top="`:${emoji.name}:`"
      unstyled
      type="button"
      class="flex h-10 w-10 items-center justify-center rounded transition-colors hover:bg-surface-100 dark:hover:bg-surface-800"
      @click="emit('pick', emoji)"
    >
      <HikariImage
        :src="emoji.src?.src"
        :alt="emoji.name"
        :processing="false"
        class="h-8 w-8"
        image-class="h-full w-full object-contain"
      />
    </Button>
  </div>
</template>

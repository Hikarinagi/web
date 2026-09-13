<script setup lang="ts">
  import { Clock } from '@lucide/vue'
  import type { UserCatalogSet } from '../composables/useUserEmojiCatalog'

  defineOptions({ name: 'HikariEditorPluginsEmojiPickerTabBar' })

  defineProps<{
    sets: UserCatalogSet[]
    activeId: string | null
  }>()

  const emit = defineEmits<{ (e: 'select', id: string): void }>()

  // id 形态:'recent' 或 'set-<id>',与 EmojiPicker 父侧 sectionIds 对齐
  const RECENT_ID = 'recent'
</script>

<template>
  <div
    class="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-b-surface-300 pb-1 dark:border-b-surface-700"
  >
    <Button
      v-tooltip.bottom="'最近使用'"
      unstyled
      type="button"
      :class="[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded transition-colors',
        activeId === RECENT_ID
          ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
          : 'text-muted-color hover:bg-surface-100 dark:hover:bg-surface-800',
      ]"
      @click="emit('select', RECENT_ID)"
    >
      <Clock :size="16" />
    </Button>

    <Button
      v-for="set in sets"
      :key="set.id"
      v-tooltip.bottom="set.name"
      unstyled
      type="button"
      :class="[
        'flex h-9 w-9 shrink-0 items-center justify-center rounded transition-colors',
        activeId === `set-${set.id}`
          ? 'bg-primary-50 dark:bg-primary-950'
          : 'hover:bg-surface-100 dark:hover:bg-surface-800',
      ]"
      @click="emit('select', `set-${set.id}`)"
    >
      <HikariImage
        v-if="set.emojis[0]?.src"
        :src="set.emojis[0].src.src"
        :alt="set.name"
        :processing="false"
        class="h-6 w-6"
        image-class="h-full w-full object-contain"
      />
      <span v-else class="text-xs text-muted-color">{{ set.name.slice(0, 2) }}</span>
    </Button>

    <span class="grow" />
    <slot name="trailing" />
  </div>
</template>

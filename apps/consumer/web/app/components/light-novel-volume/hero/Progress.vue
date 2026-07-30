<script setup lang="ts">
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'LightNovelVolumeHeroProgress' })
  const props = defineProps<{ progress: LightNovelVolumePageData['progress'] }>()

  const pct = computed(() => Math.min(100, Math.max(0, props.progress?.percentage ?? 0)))
  const done = computed(() => pct.value >= 99)
</script>

<template>
  <div v-if="progress && pct > 0" class="mx-auto flex max-w-sm flex-col gap-1.5 lg:mx-0">
    <div
      class="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs text-surface-500 dark:text-surface-400"
    >
      <span
        class="font-medium"
        :class="
          done ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-700 dark:text-surface-200'
        "
      >
        {{ done ? '已读完' : `已读 ${Math.round(pct)}%` }}
      </span>
      <span v-if="progress.current_chapter_title" class="min-w-0 truncate">
        · 上次读到「{{ progress.current_chapter_title }}」
      </span>
      <span>· {{ timeFromNow(progress.last_read) }}</span>
    </div>
    <div class="h-1 overflow-hidden rounded-full bg-surface-200/70 dark:bg-surface-700/60">
      <div
        class="h-full rounded-full"
        :class="done ? 'bg-emerald-500' : 'bg-primary'"
        :style="{ width: `${pct}%` }"
      />
    </div>
  </div>
</template>

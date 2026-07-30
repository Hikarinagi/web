<script setup lang="ts">
  import { Play } from '@lucide/vue'

  defineOptions({ name: 'LightNovelHeroContinueDialog' })

  const props = defineProps<{
    workTitle: string
    volumeId: number
    volumeLabel: string
    chapterTitle: string | null
    percentage: number
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const pct = computed(() => Math.min(100, Math.max(0, props.percentage)))

  function confirm() {
    visible.value = false
    navigateTo(`/light-novel-volumes/${props.volumeId}/read`)
  }
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    dismissable-mask
    :style="{ width: '92vw', maxWidth: '420px' }"
  >
    <template #header>
      <span class="text-[17px] font-bold text-color">继续阅读</span>
    </template>

    <div class="flex flex-col gap-4">
      <div class="min-w-0">
        <p class="truncate text-base font-semibold text-surface-950 dark:text-surface-0">
          {{ volumeLabel }}
        </p>
        <p class="mt-0.5 truncate text-sm text-surface-500 dark:text-surface-400">
          {{ workTitle }}
        </p>
      </div>

      <p v-if="chapterTitle" class="text-sm text-surface-600 dark:text-surface-300">
        上次读到 ·
        <span class="font-medium text-surface-800 dark:text-surface-100">{{ chapterTitle }}</span>
      </p>

      <div class="flex items-center gap-3">
        <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${pct}%` }" />
        </div>
        <span
          class="shrink-0 text-sm font-medium text-surface-600 tabular-nums dark:text-surface-300"
        >
          {{ Math.round(pct) }}%
        </span>
      </div>
    </div>

    <template #footer>
      <Button label="取消" text severity="secondary" @click="visible = false" />
      <Button label="继续阅读" @click="confirm">
        <template #icon>
          <Play :size="16" aria-hidden="true" />
        </template>
      </Button>
    </template>
  </Dialog>
</template>

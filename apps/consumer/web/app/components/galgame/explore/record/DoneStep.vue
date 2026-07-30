<script setup lang="ts">
  import { RotateCcw } from '@lucide/vue'
  import { GALGAME_STATUS_LABEL, type GalgameRateStatus } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameExploreRecordDoneStep' })

  defineProps<{
    selectedTitle: string
    status: GalgameRateStatus
    doneRoute: string
  }>()
  const emit = defineEmits<{
    again: []
    close: []
  }>()
</script>

<template>
  <div class="flex min-h-[420px] flex-col items-center justify-center gap-5 px-6 py-5 text-center">
    <div class="flex max-w-md flex-col gap-2">
      <h2 class="text-xl font-bold text-surface-950 dark:text-surface-50">进度已经记录啦</h2>
      <p class="text-sm leading-6 text-surface-500 dark:text-surface-400">
        《{{ selectedTitle }}》已设为「{{ GALGAME_STATUS_LABEL[status] }}」。
      </p>
    </div>
    <div class="flex flex-wrap items-center justify-center gap-3">
      <Button as="router-link" :to="doneRoute" label="查看作品" @click="emit('close')" />
      <Button label="继续记录" severity="secondary" outlined @click="emit('again')">
        <template #icon>
          <RotateCcw class="size-4" aria-hidden="true" />
        </template>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { CheckInStatus } from '~/features/checkin/checkin'

  defineOptions({ name: 'CheckinMakeUpBar' })

  const props = defineProps<{ status: CheckInStatus | null }>()
  const makeUp = computed(() => props.status?.make_up ?? null)
</script>

<template>
  <div class="flex flex-col gap-3 px-5 pb-1">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-color">
      <span class="inline-flex items-center gap-1.5">
        <span class="size-3 rounded-full bg-primary/20" aria-hidden="true" />
        已签到
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="size-3 rounded-full bg-amber-500/30" aria-hidden="true" />
        补签
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span
          class="size-3 rounded-full border border-dashed border-surface-300 dark:border-surface-600"
          aria-hidden="true"
        />
        漏签
      </span>
    </div>

    <div
      v-if="makeUp"
      class="flex items-center justify-between rounded-lg px-4 py-2.5 text-sm bg-emphasis"
    >
      <span class="text-color">本月补签 {{ makeUp.used }} / {{ makeUp.limit }} 次</span>
      <span class="inline-flex items-center gap-1 text-muted-color">
        下次消耗 {{ makeUp.next_cost }}
        <HikariPoint class="size-3.5" aria-hidden="true" />
      </span>
    </div>

    <p class="text-xs text-muted-color">点日历上的漏签日即可补签</p>
  </div>
</template>

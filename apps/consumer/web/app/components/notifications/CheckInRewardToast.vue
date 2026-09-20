<script setup lang="ts">
  import type { NotivueItem } from 'notivue'
  import type { CheckInRewardToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInRewardToast' })

  const props = defineProps<{ item: NotivueItem }>()

  const reward = computed(() => props.item.props as Partial<CheckInRewardToastProps>)
  const date = computed(() => reward.value.date ?? '')
  const points = computed(() => (typeof reward.value.points === 'number' ? reward.value.points : 0))
  const milestone = computed(() => reward.value.milestone ?? null)
</script>

<template>
  <div
    class="mr-(--p-scrollbar-width) flex min-w-72 flex-col gap-0.5 rounded-md border border-surface bg-surface-0 p-3 shadow-lg dark:bg-surface-900"
  >
    <p class="text-sm font-semibold text-color">签到成功 · {{ date }}</p>
    <p class="flex items-center gap-1 text-xs text-muted-color">
      <span>获得</span>
      <HikariPoint class="size-3.5" aria-hidden="true" />
      <span class="font-medium text-color">{{ points }}</span>
    </p>
    <p v-if="milestone" class="flex items-center gap-1 text-xs font-medium text-primary">
      <span>连续签到{{ milestone.days }}天达成，</span>
      <span>+{{ milestone.bonus }}</span>
      <HikariPoint class="size-3.5" aria-hidden="true" />
    </p>
  </div>
</template>

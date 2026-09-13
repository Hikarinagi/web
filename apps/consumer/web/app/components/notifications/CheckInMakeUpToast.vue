<script setup lang="ts">
  import type { NotivueItem } from 'notivue'
  import type { CheckInMakeUpToastProps } from '~/features/checkin/checkin'

  defineOptions({ name: 'NotificationsCheckInMakeUpToast' })

  const props = defineProps<{ item: NotivueItem }>()

  const data = computed(() => props.item.props as Partial<CheckInMakeUpToastProps>)
  const cost = computed(() => (typeof data.value.cost === 'number' ? data.value.cost : 0))
  const date = computed(() => data.value.date ?? '')
</script>

<template>
  <div
    class="mr-(--p-scrollbar-width) flex min-w-72 flex-col gap-0.5 rounded-md border border-surface bg-surface-0 p-3 shadow-lg dark:bg-surface-900"
  >
    <p class="text-sm font-semibold text-color">补签成功 · {{ date }}</p>
    <p class="flex items-center gap-1 text-xs text-muted-color">
      <span>消耗</span>
      <HikariPoint class="size-3.5" aria-hidden="true" />
      <span class="font-medium text-color">{{ cost }}</span>
    </p>
  </div>
</template>

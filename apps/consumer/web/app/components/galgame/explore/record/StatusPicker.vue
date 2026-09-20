<script setup lang="ts">
  import {
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    GALGAME_STATUS_SUB,
    type GalgameRateStatus,
  } from '~/features/galgame/rate'
  import { GALGAME_STATUS_ICON as STATUS_ICON } from '~/features/rate/status-icon'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'GalgameExploreRecordStatusPicker' })

  const value = defineModel<GalgameRateStatus>({ required: true })

  const items = GALGAME_STATUS_ORDER.map(status => ({
    status,
    label: GALGAME_STATUS_LABEL[status],
    sub: GALGAME_STATUS_SUB[status],
    icon: STATUS_ICON[status],
  }))
</script>

<template>
  <div class="grid grid-cols-2 gap-2 sm:grid-cols-5">
    <Button
      v-for="item in items"
      :key="item.status"
      unstyled
      type="button"
      :aria-pressed="value === item.status"
      :class="
        cn(
          'group flex min-h-20 flex-col items-start gap-2 rounded-lg border p-3 text-left transition',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
          value === item.status
            ? 'border-primary bg-primary-50 text-primary dark:bg-primary-950/30'
            : 'border-surface-200 bg-surface-0 text-surface-700 hover:border-surface-300 hover:bg-surface-50 dark:border-surface-800 dark:bg-surface-900 dark:text-surface-200 dark:hover:border-surface-700 dark:hover:bg-surface-800',
        )
      "
      @click="value = item.status"
    >
      <component
        :is="item.icon"
        :class="
          cn(
            'size-4.5 transition-colors',
            value === item.status
              ? 'text-primary'
              : 'text-surface-400 group-hover:text-primary dark:text-surface-500',
          )
        "
      />
      <span class="flex flex-col gap-0.5">
        <span class="text-[13px] font-semibold">{{ item.label }}</span>
        <span class="text-[11px] text-surface-500 dark:text-surface-400">{{ item.sub }}</span>
      </span>
    </Button>
  </div>
</template>

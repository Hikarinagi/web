<script setup lang="ts">
  defineOptions({ name: 'SpaceTabsBookshelfStatsRow' })

  defineProps<{ cells: { value: string; unit: string; label: string }[] }>()
</script>

<template>
  <ScrollArea
    axis="x"
    wheel-to-horizontal
    class="rounded-xl border border-surface bg-surface-0 dark:bg-surface-900"
  >
    <div
      class="flex min-w-max items-stretch divide-x divide-surface-200 py-4 dark:divide-surface-800"
    >
      <div
        v-for="cell in cells"
        :key="cell.label"
        class="flex min-w-24 flex-1 shrink-0 flex-col items-center gap-1 px-2 text-center"
      >
        <span class="flex items-baseline gap-1">
          <span class="text-2xl font-bold text-color">{{ cell.value }}</span>
          <span v-if="cell.unit" class="text-[13px] text-muted-color">{{ cell.unit }}</span>
        </span>
        <span class="text-xs text-muted-color">{{ cell.label }}</span>
      </div>
    </div>
  </ScrollArea>
</template>

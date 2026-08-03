<script setup lang="ts">
  import type { ParamRow } from '~/features/developer/guide'

  defineOptions({ name: 'DeveloperGuideParamTable' })
  defineProps<{ rows: ParamRow[] }>()
</script>

<template>
  <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
    <div
      v-for="row in rows"
      :key="row.name"
      class="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(0,12rem)_minmax(0,7rem)_1fr] sm:gap-4"
    >
      <code class="font-mono text-sm break-words text-color">{{ row.name }}</code>
      <span class="text-xs text-muted-color">{{ row.requirement }}</span>
      <span class="text-sm leading-relaxed text-muted-color">{{ row.detail }}</span>
    </div>
  </div>
</template>

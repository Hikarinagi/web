<script setup lang="ts">
  defineOptions({ name: 'MangaCoverFallback' })
  defineProps<{ title: string }>()
</script>

<template>
  <span
    class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface-100 px-4 text-center dark:bg-surface-800"
  >
    <span class="line-clamp-3 text-sm font-semibold text-surface-600 dark:text-surface-300">
      {{ title }}
    </span>
    <span class="text-xs text-surface-400 dark:text-surface-500">暂无封面</span>
  </span>
</template>

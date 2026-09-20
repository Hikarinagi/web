<script setup lang="ts">
  defineProps<{ title?: string }>()
</script>

<template>
  <div class="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
    <p class="text-lg font-semibold text-surface-700 dark:text-surface-200">
      {{ title ?? '创作者中心' }}
    </p>
    <p class="text-sm text-muted-color">此页面正在开发中</p>
  </div>
</template>

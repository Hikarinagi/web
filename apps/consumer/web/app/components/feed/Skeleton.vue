<script setup lang="ts">
  withDefaults(defineProps<{ rows?: number }>(), { rows: 5 })
</script>

<template>
  <div class="divide-y divide-surface-200 dark:divide-surface-800">
    <div v-for="i in rows" :key="i" class="flex gap-3 px-2 py-4.5">
      <Skeleton shape="circle" size="40px" class="shrink-0" />
      <div class="flex min-w-0 flex-1 flex-col gap-2.5">
        <Skeleton :width="i % 2 ? '42%' : '52%'" height="14px" />
        <Skeleton width="100%" height="15px" />
        <Skeleton :width="i % 2 ? '70%' : '85%'" height="15px" />
        <div class="flex items-center gap-14 pt-1">
          <Skeleton width="28px" height="16px" />
          <Skeleton width="28px" height="16px" />
          <Skeleton width="16px" height="16px" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  defineOptions({ name: 'CommentItemSkeleton' })
</script>

<template>
  <div class="flex gap-3.5">
    <Skeleton shape="circle" size="2.25rem" />
    <div class="flex-1 space-y-2">
      <div class="flex gap-2">
        <Skeleton width="80px" height="0.875rem" />
        <Skeleton width="50px" height="0.75rem" />
      </div>
      <Skeleton width="100%" height="0.75rem" />
      <Skeleton width="65%" height="0.75rem" />
      <div class="flex gap-3 pt-1">
        <Skeleton v-for="j in 3" :key="j" width="36px" height="0.75rem" />
      </div>
    </div>
  </div>
</template>

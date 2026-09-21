<script setup lang="ts">
  import { Inline, Skeleton, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'WorkCardSkeleton' })
</script>

<template>
  <Inline gap="sm" align="start" :wrap="false" class="p-3">
    <Skeleton class="h-28 w-20 shrink-0 rounded-lg" />
    <Stack gap="sm" class="flex-1 py-1">
      <Skeleton class="h-3.5 w-5/6" />
      <Skeleton class="h-3 w-1/2" />
      <Skeleton class="h-3 w-5/12" />
      <Skeleton class="mt-2 h-4 w-1/3" />
    </Stack>
  </Inline>
</template>

<script setup lang="ts">
  import { Inline, Skeleton, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'CommentItemSkeleton' })
</script>

<template>
  <Inline gap="sm" align="start" :wrap="false">
    <Skeleton class="size-9 shrink-0 rounded-full" />
    <Stack gap="sm" class="min-w-0 flex-1">
      <Inline gap="sm" align="center">
        <Skeleton class="h-3.5 w-20" />
        <Skeleton class="h-3 w-12.5" />
      </Inline>
      <Skeleton class="h-3 w-full" />
      <Skeleton class="h-3 w-2/3" />
      <Inline gap="sm" class="pt-1">
        <Skeleton v-for="j in 3" :key="j" class="h-3 w-9" />
      </Inline>
    </Stack>
  </Inline>
</template>

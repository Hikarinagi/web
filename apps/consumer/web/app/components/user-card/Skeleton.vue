<script setup lang="ts">
  import { Skeleton, Stack } from '@hina-ui/vue'
</script>

<template>
  <Stack gap="none" class="gap-1.5">
    <Skeleton class="h-4 w-30" />
    <Skeleton class="h-3.5 w-20" />
    <Skeleton class="mt-2 h-3.5 w-full" />
  </Stack>
</template>

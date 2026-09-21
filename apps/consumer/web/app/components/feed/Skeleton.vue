<script setup lang="ts">
  import { Inline, Skeleton, Stack } from '@hina-ui/vue'

  withDefaults(defineProps<{ rows?: number }>(), { rows: 5 })
</script>

<template>
  <Stack gap="none" class="divide-y divide-line">
    <Inline v-for="i in rows" :key="i" gap="sm" align="start" :wrap="false" class="px-2 py-4.5">
      <Skeleton class="size-10 shrink-0 rounded-full" />
      <Stack gap="sm" class="min-w-0 flex-1">
        <Skeleton class="h-3.5" :class="i % 2 ? 'w-5/12' : 'w-1/2'" />
        <Skeleton class="h-3.5 w-full" />
        <Skeleton class="h-3.5" :class="i % 2 ? 'w-2/3' : 'w-5/6'" />
        <Inline gap="xl" align="center" class="pt-1">
          <Skeleton class="h-4 w-7" />
          <Skeleton class="h-4 w-7" />
          <Skeleton class="size-4" />
        </Inline>
      </Stack>
    </Inline>
  </Stack>
</template>

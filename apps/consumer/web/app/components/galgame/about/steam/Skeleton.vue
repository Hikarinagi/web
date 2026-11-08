<script setup lang="ts">
  import { Card, Inline, Skeleton, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameAboutSteamSkeleton' })

  const TAG_WIDTHS = ['w-14', 'w-18', 'w-18', 'w-12', 'w-20', 'w-16']
</script>

<template>
  <Card :padded="false" class="overflow-hidden">
    <Inline gap="none" align="stretch" :wrap="false" class="flex-col gap-4 p-4 sm:flex-row">
      <Skeleton class="aspect-92/43 w-full shrink-0 rounded-lg sm:w-64" />

      <Stack gap="sm" class="min-w-0 flex-1">
        <Inline gap="none" align="start" justify="between" :wrap="false" class="gap-3">
          <Skeleton class="h-5 w-44" />
          <Skeleton class="h-5 w-16" />
        </Inline>
        <Skeleton class="h-3 w-full" />
        <Skeleton class="h-3 w-2/3" />
        <Skeleton class="h-3 w-60" />
        <Skeleton class="mt-auto h-8 w-34 rounded-md" />
      </Stack>
    </Inline>

    <Stack gap="sm" class="border-t border-line bg-subtle p-4">
      <Skeleton class="h-3.5 w-36" />
      <Skeleton class="h-2 w-full rounded-full" />
      <Inline gap="xs" wrap>
        <Skeleton
          v-for="(width, index) in TAG_WIDTHS"
          :key="index"
          class="h-6 rounded-md"
          :class="width"
        />
      </Inline>
    </Stack>
  </Card>
</template>

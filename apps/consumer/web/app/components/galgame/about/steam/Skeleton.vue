<script setup lang="ts">
  defineOptions({ name: 'GalgameAboutSteamSkeleton' })

  const TAG_WIDTHS = ['3.5rem', '4.5rem', '4.5rem', '3rem', '5rem', '4rem']
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900"
  >
    <div class="flex flex-col gap-4 p-4 sm:flex-row">
      <div class="aspect-92/43 w-full shrink-0 sm:w-64">
        <Skeleton height="100%" border-radius="0.5rem" />
      </div>

      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <div class="flex items-start justify-between gap-3">
          <Skeleton width="11rem" height="1.25rem" />
          <Skeleton width="4rem" height="1.25rem" />
        </div>
        <Skeleton height="0.8125rem" />
        <Skeleton width="72%" height="0.8125rem" />
        <Skeleton width="15rem" height="0.8125rem" />
        <Skeleton width="8.5rem" height="2rem" border-radius="0.375rem" class="mt-auto" />
      </div>
    </div>

    <div
      class="flex flex-col gap-3 border-t border-surface-200 bg-surface-50 p-4 dark:border-surface-800 dark:bg-surface-950"
    >
      <Skeleton width="9rem" height="0.875rem" />
      <Skeleton height="0.5rem" border-radius="9999px" />
      <div class="flex flex-wrap gap-1.5">
        <Skeleton
          v-for="(width, index) in TAG_WIDTHS"
          :key="index"
          :width="width"
          height="1.5rem"
          border-radius="0.375rem"
        />
      </div>
    </div>
  </div>
</template>

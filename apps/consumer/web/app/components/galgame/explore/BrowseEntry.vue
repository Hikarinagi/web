<script setup lang="ts">
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreBrowseEntry' })
</script>

<template>
  <section class="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">
        想按发售日、关键词筛选？
      </h2>
      <p class="text-sm text-surface-500 dark:text-surface-400">在图鉴中使用高级筛选功能</p>
    </div>
    <Button
      as="router-link"
      to="/galgames/browse"
      label="进入图鉴"
      icon-pos="right"
      severity="secondary"
      outlined
    >
      <template #icon>
        <ArrowUpRight class="size-4" aria-hidden="true" />
      </template>
    </Button>
  </section>
</template>

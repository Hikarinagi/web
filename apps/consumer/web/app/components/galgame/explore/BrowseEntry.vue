<script setup lang="ts">
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreBrowseEntry' })
</script>

<template>
  <section class="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-surface-900 dark:text-surface-100">
        想按发售日、关键词慢慢翻?
      </h2>
      <p class="text-sm text-surface-500 dark:text-surface-400">
        图鉴里可以按发售日排序、输入关键词搜索，也能继续翻看完整作品库。
      </p>
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

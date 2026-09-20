<script setup lang="ts">
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreReleaseRow' })
  const props = defineProps<{
    release: GalgamesPageData['release'] | GalgamesPageData['last_month']
    title?: string
    to?: string
  }>()

  const heading = computed(
    () => props.title || (props.release.current_month ? '本月新作' : '新近发售'),
  )
  const total = computed(() =>
    'total_items' in props.release ? props.release.total_items : props.release.items.length,
  )
  const meta = computed(() =>
    props.title || props.release.current_month
      ? `${props.release.year} 年 ${props.release.month} 月 · ${total.value} 部`
      : `${total.value} 部`,
  )
</script>

<template>
  <section v-if="release.items.length" class="flex flex-col gap-4">
    <div class="flex flex-col gap-4 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <div class="flex items-baseline gap-3">
          <h2 class="text-2xl font-bold text-surface-950 dark:text-white">{{ heading }}</h2>
          <p class="text-sm text-surface-500 dark:text-surface-400">{{ meta }}</p>
        </div>
        <p v-if="release.current_month" class="text-sm text-surface-500 dark:text-surface-400">
          每月新作一般会集中在月末的周五发售
        </p>
      </div>
      <ViewAllLink v-if="to" :to="to" class="sm:ml-auto" />
      <Button
        v-else-if="release.current_month"
        as="router-link"
        icon-pos="right"
        severity="secondary"
        label="数据缺失？来创建！"
        outlined
        to="/create/edit"
        target="_blank"
      >
        <template #icon>
          <ArrowUpRight class="size-4" aria-hidden="true" />
        </template>
      </Button>
    </div>

    <ScrollArea axis="x" shadow="end" arrows class="-mx-6">
      <div class="flex min-w-max gap-4 px-6 pb-2">
        <GalgameExploreReleaseCard v-for="item in release.items" :key="item.id" :item="item" />
      </div>
    </ScrollArea>
  </section>
</template>

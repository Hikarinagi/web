<script setup lang="ts">
  import { GitPullRequest } from '@lucide/vue'
  import {
    CONTRIBUTION_TYPE_FILTERS,
    SPACE_CONTRIBUTION_PAGE_SIZE,
    type SpaceContributionPage,
  } from '~/features/space/space'
  import { usePagedList } from '~/features/space/usePagedList'
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'

  defineOptions({ name: 'SpaceTabsContributions' })

  const props = defineProps<{
    userId: number
    contributions: SpaceContributionPage
    statistics: SpacePageData['statistics']
  }>()

  const filter = ref<'all' | (typeof CONTRIBUTION_TYPE_FILTERS)[number]['type']>('all')

  const chips = computed(() => {
    const typed = CONTRIBUTION_TYPE_FILTERS.map(f => ({
      key: f.type,
      label: f.label,
      count: props.statistics[f.countKey],
    }))
      .filter(c => c.count > 0)
      .sort((a, b) => b.count - a.count)
    const all = typed.reduce((sum, c) => sum + c.count, 0)
    return [{ key: 'all' as const, label: '全部', count: all }, ...typed]
  })

  const { list, pending, loadPage } = usePagedList(props.contributions, page =>
    hikariRequest('/api/v3/user/{id}/contributions', {
      path: { id: props.userId },
      query: {
        page,
        page_size: SPACE_CONTRIBUTION_PAGE_SIZE,
        ...(filter.value !== 'all' ? { resource_type: filter.value } : {}),
      },
    }),
  )

  watch(filter, () => loadPage(1))
</script>

<template>
  <div class="flex flex-col gap-4 pt-2">
    <div v-if="chips.length > 1" class="flex flex-wrap items-center gap-2">
      <Button
        v-for="c in chips"
        :key="c.key"
        unstyled
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          filter === c.key ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'
        "
        @click="filter = c.key"
      >
        {{ c.label }} {{ c.count }}
      </Button>
    </div>

    <LoadingOverlay v-if="list.items.length" :loading="pending" content-class="flex flex-col">
      <SpaceTabsContributionsRow v-for="item in list.items" :key="item.id" :item="item" />
    </LoadingOverlay>
    <SpaceEmptyState v-else :icon="GitPullRequest" text="还没有 Wiki 贡献" />

    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </div>
</template>

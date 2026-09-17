<script setup lang="ts">
  import { Chip, Inline, Stack } from '@hina-ui/vue'
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
  <Stack gap="md" class="pt-2">
    <Inline v-if="chips.length > 1" gap="sm">
      <Chip
        v-for="c in chips"
        :key="c.key"
        selectable
        :selected="filter === c.key"
        :tone="filter === c.key ? 'accent' : 'neutral'"
        @update:selected="filter = c.key"
      >
        {{ c.label }} {{ c.count }}
      </Chip>
    </Inline>

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
  </Stack>
</template>

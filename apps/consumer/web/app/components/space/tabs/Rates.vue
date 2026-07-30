<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import {
    RATE_STATUS_FILTERS,
    SPACE_RATE_PAGE_SIZE,
    type SpaceRatePage,
    type SpaceRateStatusCounts,
  } from '~/features/space/space'
  import { usePagedList } from '~/features/space/usePagedList'

  defineOptions({ name: 'SpaceTabsRates' })

  const props = defineProps<{
    userId: number
    rates: SpaceRatePage
    counts: SpaceRateStatusCounts
  }>()

  const filter = ref('all')
  const activeStatus = computed(
    () => RATE_STATUS_FILTERS.find(f => f.key === filter.value)?.status ?? null,
  )

  function query(page: number) {
    return {
      page,
      page_size: SPACE_RATE_PAGE_SIZE,
      ...(activeStatus.value ? { status: activeStatus.value } : {}),
    }
  }

  const { list, pending, loadPage } = usePagedList(props.rates, page =>
    hikariRequest('/api/v3/user/{id}/rates', {
      path: { id: props.userId },
      query: query(page),
    }),
  )

  watch(filter, () => loadPage(1))
</script>

<template>
  <div class="flex flex-col gap-4 pt-2">
    <div class="flex flex-wrap items-center gap-2">
      <Button
        v-for="f in RATE_STATUS_FILTERS"
        :key="f.key"
        unstyled
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="
          filter === f.key ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'
        "
        @click="filter = f.key"
      >
        {{ f.label }} {{ counts[f.key] }}
      </Button>
    </div>

    <LoadingOverlay v-if="list.items.length" :loading="pending" content-class="flex flex-col">
      <SpaceTabsRatesRow
        v-for="item in list.items"
        :key="`${item.work_type}:${item.id}`"
        :item="item"
      />
    </LoadingOverlay>
    <SpaceEmptyState v-else :icon="Star" text="还没有评分或标记任何作品" />
    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </div>
</template>

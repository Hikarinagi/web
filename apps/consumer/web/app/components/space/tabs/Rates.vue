<script setup lang="ts">
  import { Star } from '@lucide/vue'
  import { readSpaceRouteQuery } from '~/features/space/route'
  import {
    RATE_STATUS_FILTERS,
    RATE_WORK_FILTERS,
    SPACE_RATE_PAGE_SIZE,
    rateStatusBuckets,
    rateStatusFilterLabel,
    type RateStatusFilterKey,
    type RateWorkFilterKey,
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

  const route = useRoute()
  const router = useRouter()

  const initialRoute = readSpaceRouteQuery(route.query)
  const work = ref<RateWorkFilterKey>(initialRoute.work)
  const status = ref<RateStatusFilterKey>(initialRoute.status)

  const buckets = computed(() => rateStatusBuckets(props.counts, work.value))
  const activeWorkType = computed(
    () => RATE_WORK_FILTERS.find(f => f.key === work.value)?.workType ?? null,
  )
  const activeStatus = computed(
    () => RATE_STATUS_FILTERS.find(f => f.key === status.value)?.status ?? null,
  )

  const { list, pending, loadPage } = usePagedList(props.rates, page =>
    hikariRequest('/api/v3/user/{id}/rates', {
      path: { id: props.userId },
      query: {
        page,
        page_size: SPACE_RATE_PAGE_SIZE,
        ...(activeWorkType.value ? { work_type: activeWorkType.value } : {}),
        ...(activeStatus.value ? { status: activeStatus.value } : {}),
      },
    }),
  )

  function selectWork(key: RateWorkFilterKey) {
    if (key === work.value) return
    work.value = key
    void applyFilter()
  }

  function selectStatus(key: RateStatusFilterKey) {
    if (key === status.value) return
    status.value = key
    void applyFilter()
  }

  async function applyFilter() {
    await router.replace({
      query: {
        ...route.query,
        page: undefined,
        page_size: undefined,
        work: work.value === 'all' ? undefined : work.value,
        status: status.value === 'all' ? undefined : status.value,
      },
    })
    await loadPage(1)
  }
</script>

<template>
  <div class="flex flex-col gap-4 pt-2">
    <div class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="f in RATE_WORK_FILTERS"
          :key="f.key"
          unstyled
          class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          :class="
            work === f.key ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'
          "
          @click="selectWork(f.key)"
        >
          {{ f.label }} {{ rateStatusBuckets(counts, f.key).all }}
        </Button>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <Button
          v-for="f in RATE_STATUS_FILTERS"
          :key="f.key"
          unstyled
          class="cursor-pointer rounded-lg px-2.5 py-1 text-[13px] transition-colors"
          :class="
            status === f.key
              ? 'font-medium bg-emphasis text-color'
              : 'text-muted-color hover:text-color'
          "
          @click="selectStatus(f.key)"
        >
          {{ rateStatusFilterLabel(work, f.key) }} {{ buckets[f.key] }}
        </Button>
      </div>
    </div>

    <LoadingOverlay v-if="list.items.length" :loading="pending" content-class="flex flex-col">
      <SpaceTabsRatesRow
        v-for="item in list.items"
        :key="`${item.work_type}:${item.id}`"
        :item="item"
      />
    </LoadingOverlay>
    <SpaceEmptyState v-else :icon="Star" text="还没有标记任何作品" />
    <Paginator
      v-if="list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="loadPage"
    />
  </div>
</template>

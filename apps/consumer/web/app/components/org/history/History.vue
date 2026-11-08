<script setup lang="ts">
  import {
    LoadingOverlay,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import type { OrgListState, OrgSort } from '~/features/org/results'
  import type { OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHistory' })
  const props = defineProps<{
    groups: { code: string; label: string; count: number }[]
    total: number
    works: OrgWork[]
    meta: ProducerPageData['list']['meta']
    state: OrgListState
    pending: boolean
    rated: boolean
  }>()
  const emit = defineEmits<{ update: [partial: Partial<OrgListState>] }>()

  const tabs = computed(() =>
    props.groups.length > 1
      ? [{ code: 'ALL', label: '全部作品', count: props.total }, ...props.groups]
      : [],
  )
  const sorts = computed(() => [
    { value: 'new', label: '最新' },
    { value: 'old', label: '最早' },
    ...(props.rated ? [{ value: 'rating', label: '评分' }] : []),
  ])
  const tab = computed({
    get: () => props.state.tab,
    set: value => emit('update', { tab: value }),
  })
  const sort = computed({
    get: () => props.state.sort,
    set: (value: OrgSort) => emit('update', { sort: value }),
  })
</script>

<template>
  <Stack gap="md">
    <EntrySectionHead id="works" title="作品年表" :count="meta.total_items">
      <template #actions>
        <SegmentedControl v-model="sort" :options="sorts" size="sm" aria-label="排序" />
      </template>
    </EntrySectionHead>
    <Tabs v-if="tabs.length" v-model="tab">
      <TabsList label="按职能">
        <TabsTrigger v-for="item in tabs" :key="item.code" :value="item.code">
          {{ item.label }}
          <Text as="span" size="sm" tone="faint" class="tabular-nums">{{ item.count }}</Text>
        </TabsTrigger>
      </TabsList>
    </Tabs>
    <Stack gap="lg" class="relative">
      <SimpleGrid min="22rem" gap="sm">
        <OrgHistoryRow v-for="work in works" :key="`${work.kind}${work.id}`" :work="work" />
      </SimpleGrid>
      <Paginator
        v-if="meta.total_pages > 1"
        :meta="meta"
        :loading="pending"
        route="push"
        align="center"
        scroll-target="#works"
      />
      <LoadingOverlay :visible="pending" />
    </Stack>
  </Stack>
</template>

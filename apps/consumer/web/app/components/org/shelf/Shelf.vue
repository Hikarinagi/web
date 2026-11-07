<script setup lang="ts">
  import {
    Button as HnButton,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { inGroup, sortWorks, today, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgShelf' })
  const props = defineProps<{
    works: OrgWork[]
    groups: { code: string; label: string; count: number }[]
  }>()
  const tab = defineModel<string>({ required: true })

  const PAGE = 32
  const sort = ref('new')
  const year = ref<string | null>(null)
  const all = ref(false)

  const tabs = computed(() =>
    props.groups.length > 1
      ? [{ code: 'ALL', label: '全部', count: props.works.length }, ...props.groups]
      : [],
  )
  const sorts = computed(() => [
    { value: 'new', label: '最新' },
    { value: 'old', label: '最早' },
    ...(props.works.some(work => work.rating.count > 0)
      ? [{ value: 'rating', label: '评分' }]
      : []),
  ])
  const released = computed(() => props.works.filter(work => !work.date || work.date <= today()))
  const inTab = computed(() => released.value.filter(work => inGroup(work, tab.value)))
  const listed = computed(() =>
    sortWorks(
      inTab.value.filter(work => !year.value || work.date?.startsWith(year.value)),
      sort.value,
    ),
  )
  const shown = computed(() => (all.value ? listed.value : listed.value.slice(0, PAGE)))
  watch([tab, year, sort], () => (all.value = false))
  watch(tab, () => (year.value = null))
</script>

<template>
  <Stack gap="none" class="gap-12">
    <OrgShelfRecent :works="works" />
    <Stack gap="md">
      <EntrySectionHead id="works" title="全部作品" :count="listed.length">
        <template #actions>
          <SegmentedControl v-model="sort" :options="sorts" size="sm" aria-label="排序" />
        </template>
      </EntrySectionHead>
      <Tabs v-if="tabs.length" v-model="tab">
        <TabsList label="按类别">
          <TabsTrigger v-for="item in tabs" :key="item.code" :value="item.code">
            {{ item.label }}
            <Text as="span" size="sm" tone="faint" class="tabular-nums">{{ item.count }}</Text>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <OrgCatalogYears v-model="year" :works="inTab" />
      <SimpleGrid min="8.5rem" gap="md" class="gap-y-6 pt-2">
        <OrgCatalogCard v-for="work in shown" :key="`${work.kind}${work.id}`" :work="work" />
      </SimpleGrid>
      <HnButton
        v-if="listed.length > PAGE"
        variant="soft"
        tone="neutral"
        class="self-center"
        @click="all = !all"
      >
        {{ all ? '收起' : `显示全部 ${listed.length} 部` }}
      </HnButton>
    </Stack>
  </Stack>
</template>

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
  import { inGroup, sortWorks, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHistory' })
  const props = defineProps<{
    works: OrgWork[]
    groups: { code: string; label: string; count: number }[]
  }>()
  const tab = defineModel<string>({ required: true })

  const PAGE = 20
  const sort = ref('new')
  const all = ref(false)
  const tabs = computed(() =>
    props.groups.length > 1
      ? [{ code: 'ALL', label: '全部作品', count: props.works.length }, ...props.groups]
      : [],
  )
  const sorts = computed(() => [
    { value: 'new', label: '最新' },
    { value: 'old', label: '最早' },
    ...(props.works.some(work => work.rating.count > 0)
      ? [{ value: 'rating', label: '评分' }]
      : []),
  ])
  const listed = computed(() =>
    sortWorks(
      props.works.filter(work => inGroup(work, tab.value)),
      sort.value,
    ),
  )
  const shown = computed(() => (all.value ? listed.value : listed.value.slice(0, PAGE)))
  watch([tab, sort], () => (all.value = false))
</script>

<template>
  <Stack gap="md">
    <EntrySectionHead id="works" title="作品年表" :count="listed.length">
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
    <SimpleGrid min="22rem" gap="sm">
      <OrgHistoryRow v-for="work in shown" :key="`${work.kind}${work.id}`" :work="work" />
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
</template>

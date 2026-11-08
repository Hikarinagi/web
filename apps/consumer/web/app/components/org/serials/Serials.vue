<script setup lang="ts">
  import {
    Inline,
    Link,
    LoadingOverlay,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tabs,
    TabsList,
    TabsTrigger,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { monthText } from '~/features/entry/date'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import type { OrgListState } from '~/features/org/results'
  import type { OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgSerials' })
  const props = defineProps<{
    popular: OrgWork[]
    works: OrgWork[]
    meta: ProducerPageData['list']['meta']
    state: OrgListState
    pending: boolean
  }>()
  const emit = defineEmits<{ update: [partial: Partial<OrgListState>] }>()

  const tabs = [
    { value: 'ALL', label: '全部' },
    { value: 'COMPLETED', label: '已完结' },
  ]
  const status = computed({
    get: () => props.state.status,
    set: value => emit('update', { status: value }),
  })
  const featured = computed(() => props.popular.filter(work => work.cover))
  const rows = computed(() =>
    props.works.map(work => ({
      id: work.id,
      title: work.title,
      authors: work.authors,
      period: work.date ? `${monthText(work.date)}起` : '日期不详',
    })),
  )
</script>

<template>
  <Stack gap="none" class="gap-12">
    <Stack v-if="featured.length" gap="md">
      <EntrySectionHead title="人气连载" />
      <ScrollRail class="-mx-4 lg:-mx-1">
        <Inline
          gap="md"
          align="start"
          :wrap="false"
          class="w-max px-4 py-1 lg:grid lg:w-full lg:grid-cols-8 lg:px-1"
        >
          <OrgCatalogCard
            v-for="work in featured"
            :key="work.id"
            :work="work"
            class="w-28 shrink-0 lg:w-auto"
          />
        </Inline>
      </ScrollRail>
    </Stack>
    <Stack gap="md">
      <EntrySectionHead id="works" title="全部连载" :count="meta.total_items" />
      <Tabs v-model="status">
        <TabsList label="按连载状态">
          <TabsTrigger v-for="tab in tabs" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Stack gap="lg" class="relative">
        <Table class="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>作品</TableHead>
              <TableHead class="hidden md:table-cell">作者</TableHead>
              <TableHead align="end" class="hidden md:table-cell">连载期间</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in rows" :key="row.id">
              <TableCell class="max-w-0 py-2">
                <Stack gap="none" class="min-w-0">
                  <Link
                    :as="NuxtLink"
                    :to="`/mangas/${row.id}`"
                    tone="neutral"
                    class="truncate font-medium"
                    lang="ja"
                  >
                    {{ row.title }}
                  </Link>
                  <Text size="xs" tone="muted" truncate class="md:hidden" lang="ja">
                    {{ row.authors }}
                  </Text>
                </Stack>
              </TableCell>
              <TableCell class="hidden max-w-0 md:table-cell">
                <Text size="sm" tone="muted" truncate lang="ja">{{ row.authors }}</Text>
              </TableCell>
              <TableCell
                align="end"
                class="hidden text-sm whitespace-nowrap tabular-nums md:table-cell"
              >
                {{ row.period }}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
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
  </Stack>
</template>

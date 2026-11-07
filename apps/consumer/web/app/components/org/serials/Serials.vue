<script setup lang="ts">
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import {
    Inline,
    Link,
    Pagination,
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
  import type { OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgSerials' })
  const props = defineProps<{ producerId: number; popular: OrgWork[]; total: number }>()

  const PAGE = 40
  const POPULAR = 8
  const TABS = [
    { value: 'ONGOING', label: '连载中' },
    { value: 'COMPLETED', label: '已完结' },
    { value: '', label: '全部' },
  ]
  const status = ref('ONGOING')
  const page = ref(1)
  watch(status, () => (page.value = 1))
  const data = shallowRef<ApiData<'/api/v3/producers/{id}/mangas', 'get'> | null>(null)
  const pending = ref(false)
  let sequence = 0

  async function load() {
    const current = ++sequence
    pending.value = true
    const result = await hikariRequest<'/api/v3/producers/{id}/mangas', 'get'>(
      '/api/v3/producers/{id}/mangas',
      {
        method: 'get',
        path: { id: props.producerId },
        query: {
          page: page.value,
          page_size: PAGE,
          sort: 'recent',
          ...(status.value ? { status: status.value } : {}),
        },
      },
    ).catch(() => null)
    if (current !== sequence) return
    data.value = result
    pending.value = false
  }
  onMounted(load)
  watch([status, page], load)

  const featured = computed(() => props.popular.filter(work => work.cover).slice(0, POPULAR))
  const rows = computed(() =>
    (data.value?.items ?? []).map(({ manga, people }) => ({
      id: manga.id,
      title: manga.name_cn || manga.name,
      authors: people.map(person => person.name).join('、'),
      period: manga.publication_date ? `${monthText(manga.publication_date)}起` : '日期不详',
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
      <EntrySectionHead id="works" title="全部连载" :count="total" />
      <Tabs v-model="status">
        <TabsList label="按连载状态">
          <TabsTrigger v-for="tab in TABS" :key="tab.value" :value="tab.value">
            {{ tab.label }}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <LoadingOverlay :loading="pending">
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
      </LoadingOverlay>
      <Pagination
        v-if="(data?.meta.total_items ?? 0) > PAGE"
        v-model="page"
        :total="data?.meta.total_items ?? 0"
        :page-size="PAGE"
        class="self-center"
      />
    </Stack>
  </Stack>
</template>

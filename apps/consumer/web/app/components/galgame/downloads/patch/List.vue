<script setup lang="ts">
  import {
    Avatar,
    DataTable,
    Empty,
    Inline,
    Link,
    NumberFormat,
    Stack,
    Tag,
    Text,
    Time,
    type DataTableColumn,
  } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import {
    patchLanguageOptions,
    patchLanguages,
    patchPlatformOptions,
    patchPlatforms,
    patchSizeBytes,
    patchSizeLabel,
    patchTypeLabel,
    patchTypeOptions,
  } from '~/features/galgame/patch'
  import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'

  type Patch = NonNullable<GalgameDownloadsPageData['patches']>['translation'][number]

  defineOptions({ name: 'GalgameDownloadsPatchList' })
  const props = defineProps<{ patches: GalgameDownloadsPageData['patches'] }>()

  const rows = computed(() =>
    props.patches ? [...props.patches.translation, ...props.patches.other] : [],
  )
  const translationIds = computed(
    () => new Set(props.patches?.translation.map(patch => patch.id) ?? []),
  )
  const search = ref('')
  const selects = computed(() => [
    { key: 'type', label: '类型', options: patchTypeOptions(rows.value.flatMap(row => row.type)) },
    {
      key: 'language',
      label: '语言',
      options: patchLanguageOptions(rows.value.flatMap(row => row.language)),
    },
    {
      key: 'platform',
      label: '平台',
      options: patchPlatformOptions(rows.value.flatMap(row => row.platform)),
    },
  ])

  const columns: DataTableColumn<Patch>[] = [
    {
      key: 'name',
      label: '补丁',
      filter: (row, query) =>
        [row.name, row.publisher?.name ?? '', row.model_name, row.note].some(text =>
          text.toLowerCase().includes(query.toLowerCase()),
        ),
    },
    {
      key: 'type',
      label: '类型',
      accessor: row => row.type.map(patchTypeLabel).join('、'),
      filterValue: (row, value) => row.type.includes(String(value)),
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'language',
      label: '语言',
      accessor: row => patchLanguages(row.language),
      filterValue: (row, value) => row.language.includes(String(value)),
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'platform',
      label: '平台',
      accessor: row => patchPlatforms(row.platform),
      filterValue: (row, value) => row.platform.includes(String(value)),
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'size',
      label: '大小',
      align: 'end',
      sortable: true,
      accessor: row => patchSizeBytes(row.size),
      headerClass: 'max-md:hidden whitespace-nowrap',
      cellClass: 'max-md:hidden whitespace-nowrap tabular-nums',
    },
    {
      key: 'download_count',
      label: '下载量',
      align: 'end',
      sortable: true,
      headerClass: 'max-md:hidden whitespace-nowrap',
      cellClass: 'max-md:hidden whitespace-nowrap tabular-nums',
    },
    {
      key: 'updated_at',
      label: '更新时间',
      sortable: true,
      accessor: row => new Date(row.updated_at),
      headerClass: 'max-md:hidden whitespace-nowrap',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'actions',
      label: '操作',
      align: 'end',
      pin: 'end',
      filterable: false,
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden',
    },
  ]
</script>

<template>
  <Empty v-if="!patches" title="无法加载补丁列表" description="请刷新页面，稍后再试" />

  <Empty
    v-else-if="!rows.length"
    title="还没有补丁"
    description="moyu.moe 上没有列出此游戏的补丁"
  />

  <Stack v-else>
    <DataTable
      v-model:filter="search"
      :rows="rows"
      :columns="columns"
      row-key="id"
      label="补丁"
      empty-text="没有匹配的补丁"
    >
      <template #toolbar="{ columnFilters, api }">
        <GalgameDownloadsFilters
          v-model:search="search"
          placeholder="搜索补丁名称、发布者和备注"
          :selects="selects"
          :column-filters="columnFilters"
          @filter="api.setFilter"
        />
      </template>

      <template #cell-name="{ row }">
        <Stack gap="xs" class="py-2">
          <Text weight="medium">{{ row.name || patchTypeLabel(row.type[0] ?? 'other') }}</Text>
          <Text size="sm" tone="muted" class="line-clamp-1">
            {{ [row.publisher?.name, row.model_name, row.note].filter(Boolean).join(' · ') }}
          </Text>
          <Text size="sm" tone="muted" class="md:hidden">
            {{ row.type.map(patchTypeLabel).join('、') }} · {{ patchLanguages(row.language) }} ·
            {{ patchPlatforms(row.platform) }} · {{ patchSizeLabel(row.size) }}
          </Text>
          <Button
            as="a"
            :href="row.web_url"
            target="_blank"
            rel="noreferrer"
            size="sm"
            variant="soft"
            class="w-fit md:hidden"
          >
            前往下载
            <template #trailing><ExternalLink /></template>
          </Button>
        </Stack>
      </template>

      <template #cell-type="{ row }">
        <Tag
          v-for="code in row.type"
          :key="code"
          :tone="translationIds.has(row.id) ? 'accent' : 'neutral'"
        >
          {{ patchTypeLabel(code) }}
        </Tag>
      </template>

      <template #cell-language="{ row }">{{ patchLanguages(row.language) }}</template>

      <template #cell-platform="{ row }">{{ patchPlatforms(row.platform) }}</template>

      <template #cell-size="{ row }">{{ patchSizeLabel(row.size) }}</template>

      <template #cell-download_count="{ row }">
        <NumberFormat :value="row.download_count" />
      </template>

      <template #cell-updated_at="{ row }">
        <Time :value="row.updated_at" format="date" />
      </template>

      <template #cell-actions="{ row }">
        <Button
          as="a"
          :href="row.web_url"
          target="_blank"
          rel="noreferrer"
          size="sm"
          variant="soft"
        >
          前往下载
          <template #trailing><ExternalLink /></template>
        </Button>
      </template>
    </DataTable>

    <Inline gap="sm">
      <Text as="span" size="sm" tone="muted">来自</Text>
      <Inline
        :as="Link"
        :href="patches.web_url ?? undefined"
        target="_blank"
        rel="noreferrer"
        tone="neutral"
        gap="sm"
      >
        <Avatar src="/brand/kungal.webp" name="鲲 Galgame" size="sm" />
        <Text as="span" size="sm" weight="semibold">鲲 Galgame</Text>
        <Tag pill class="bg-kungal/20 text-kungal-text">补丁</Tag>
      </Inline>
    </Inline>
  </Stack>
</template>

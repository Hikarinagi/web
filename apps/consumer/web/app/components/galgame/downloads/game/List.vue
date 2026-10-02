<script setup lang="ts">
  import {
    CopyButton,
    DataTable,
    Empty,
    Inline,
    NumberFormat,
    Stack,
    Tag,
    Text,
    Time,
    type DataTableColumn,
  } from '@hina-ui/vue'
  import { HardDriveDownload } from '@lucide/vue'
  import { fileSizeLabel, languageLabel, sortLanguages } from '~/features/galgame/download'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { useDownloadLink } from '~/features/galgame/useDownloadLink'
  import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'

  type Resource = NonNullable<GalgameDownloadsPageData['resources']>[number]
  type FileRow = Resource['files'][number] & { resource: Resource }

  defineOptions({ name: 'GalgameDownloadsGameList' })
  const props = defineProps<{
    galgameId: number
    resources: GalgameDownloadsPageData['resources']
  }>()

  const { pendingIds, download, copyLinks } = useDownloadLink(props.galgameId)
  const search = ref('')

  const rows = computed<FileRow[]>(() =>
    (props.resources ?? []).flatMap(resource =>
      resource.files.map(file => ({ ...file, resource })),
    ),
  )
  const selects = computed(() => [
    {
      key: 'language',
      label: '语言',
      options: sortLanguages([...new Set(rows.value.flatMap(row => row.resource.language))]).map(
        code => ({ value: code, label: languageLabel(code) }),
      ),
    },
    {
      key: 'platform',
      label: '平台',
      options: sortPlatforms([...new Set(rows.value.flatMap(row => row.resource.platform))]).map(
        code => ({ value: code, label: platformLabel(code) }),
      ),
    },
  ])

  const resourceLanguages = (resource: Resource) =>
    sortLanguages(resource.language).map(languageLabel).join('、')
  const resourcePlatform = (resource: Resource) =>
    [sortPlatforms(resource.platform).map(platformLabel).join('、'), resource.simulator]
      .filter(Boolean)
      .join(' · ')

  const columns: DataTableColumn<FileRow>[] = [
    {
      key: 'file_name',
      label: '文件',
      filter: (row, query) =>
        [row.file_name, row.resource.note ?? ''].some(text =>
          text.toLowerCase().includes(query.toLowerCase()),
        ),
    },
    {
      key: 'language',
      label: '语言',
      accessor: row => resourceLanguages(row.resource),
      filterValue: (row, value) => row.resource.language.includes(String(value)),
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'platform',
      label: '平台',
      accessor: row => resourcePlatform(row.resource),
      filterValue: (row, value) => row.resource.platform.includes(String(value)),
      headerClass: 'max-md:hidden',
      cellClass: 'max-md:hidden whitespace-nowrap',
    },
    {
      key: 'file_size',
      label: '大小',
      align: 'end',
      sortable: true,
      accessor: row => Number(row.file_size),
      headerClass: 'max-md:hidden whitespace-nowrap',
      cellClass: 'max-md:hidden whitespace-nowrap tabular-nums',
    },
    {
      key: 'downloads',
      label: '下载量',
      align: 'end',
      sortable: true,
      accessor: row => row.resource.downloads,
      headerClass: 'max-md:hidden whitespace-nowrap',
      cellClass: 'max-md:hidden whitespace-nowrap tabular-nums',
    },
    {
      key: 'updated',
      label: '更新时间',
      sortable: true,
      accessor: row => new Date(row.resource.updated),
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
  <Empty v-if="!resources" title="无法加载下载列表" description="请刷新页面，稍后再试" />

  <Empty v-else-if="!resources.length" title="暂无可下载资源" description="这部作品还没有资源上传">
    <template #icon><HardDriveDownload /></template>
  </Empty>

  <DataTable
    v-else
    v-model:filter="search"
    :rows="rows"
    :columns="columns"
    row-key="id"
    label="游戏文件"
    empty-text="没有匹配的文件"
  >
    <template #toolbar="{ columnFilters, api }">
      <GalgameDownloadsFilters
        v-model:search="search"
        placeholder="搜索文件名和备注"
        :selects="selects"
        :column-filters="columnFilters"
        @filter="api.setFilter"
      />
    </template>

    <template #cell-file_name="{ row }">
      <Stack gap="xs" class="py-2">
        <Inline gap="xs" align="start" :wrap="false">
          <Text weight="medium" class="break-all">{{ row.file_name }}</Text>
          <CopyButton
            v-if="row.file_hash"
            :text="row.file_hash"
            :label="`复制 ${(row.hash_algorithm ?? 'hash').toUpperCase()} 校验和`"
            tooltip
          />
        </Inline>
        <Text
          v-if="row.resource.note"
          as="div"
          size="sm"
          tone="muted"
          class="break-all whitespace-pre-line"
        >
          <GalgameDownloadsGameNote :source="row.resource.note" />
        </Text>
        <Text size="sm" tone="muted" class="md:hidden">
          {{ resourceLanguages(row.resource) }} · {{ resourcePlatform(row.resource) }} ·
          {{ fileSizeLabel(row.file_size) }}
        </Text>
        <GalgameDownloadsGameFileActions
          class="md:hidden"
          :loading="pendingIds.includes(row.id)"
          @download="download(row.id)"
          @copy="copyLinks([row.id])"
        />
      </Stack>
    </template>

    <template #cell-language="{ row }">
      <Inline gap="xs" :wrap="false">
        <Tag
          v-for="code in sortLanguages(row.resource.language)"
          :key="code"
          :tone="code.startsWith('zh') ? 'accent' : 'neutral'"
        >
          {{ languageLabel(code) }}
        </Tag>
      </Inline>
    </template>

    <template #cell-platform="{ row }">{{ resourcePlatform(row.resource) }}</template>

    <template #cell-file_size="{ row }">{{ fileSizeLabel(row.file_size) }}</template>

    <template #cell-downloads="{ row }">
      <NumberFormat :value="row.resource.downloads" />
    </template>

    <template #cell-updated="{ row }">
      <Time :value="row.resource.updated" format="date" />
    </template>

    <template #cell-actions="{ row }">
      <GalgameDownloadsGameFileActions
        class="justify-end"
        :loading="pendingIds.includes(row.id)"
        @download="download(row.id)"
        @copy="copyLinks([row.id])"
      />
    </template>
  </DataTable>
</template>

<script setup lang="ts">
  import {
    Card,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { dayText, monthText } from '~/features/entry/date'
  import { volumePrice } from '~/features/light-novel-volume/price'
  import { CODE_LABELS } from '~/features/wiki/codes'

  defineOptions({ name: 'MangaVolumeEditions' })
  const props = defineProps<{ editions: MangaVolumePageData['volume']['editions'] }>()

  const rows = computed(() =>
    props.editions.map(edition => ({
      key: edition.entry_id,
      title: edition.title ?? '',
      format: edition.format ? (CODE_LABELS.BOOK_FORMAT?.[edition.format] ?? '') : '',
      part: edition.part,
      publishers: [...edition.publishers, ...edition.labels].map(item => item.name).join('、'),
      isbn: edition.isbn ?? '',
      date:
        edition.release_date_precision === 'YEAR'
          ? `${edition.release_date?.slice(0, 4)} 年`
          : edition.release_date_precision === 'MONTH'
            ? monthText(edition.release_date)
            : dayText(edition.release_date),
      pages: edition.page_count ?? '',
      price: volumePrice({
        price_amount: edition.price,
        price_currency: edition.currency,
        price_tax_included: edition.tax_included,
      }),
    })),
  )
</script>

<template>
  <EntrySectionHead id="editions" title="出版版本" :count="rows.length" />
  <Card :padded="false">
    <Table class="[&_td]:align-top [&_th]:whitespace-nowrap">
      <TableHeader>
        <TableRow>
          <TableHead>书名</TableHead>
          <TableHead>出版社</TableHead>
          <TableHead>ISBN</TableHead>
          <TableHead>发售日</TableHead>
          <TableHead align="end">页数</TableHead>
          <TableHead align="end">价格</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.key">
          <TableCell class="min-w-48">
            <Stack gap="none">
              <Text as="span" size="sm" lang="ja">{{ row.title }}</Text>
              <Text v-if="row.format" as="span" size="xs" tone="muted">{{ row.format }}</Text>
              <Text v-if="row.part" as="span" size="xs" tone="muted">
                所收部分：<Text as="span" size="xs" lang="ja">{{ row.part }}</Text>
              </Text>
            </Stack>
          </TableCell>
          <TableCell lang="ja" class="whitespace-nowrap">{{ row.publishers }}</TableCell>
          <TableCell class="whitespace-nowrap tabular-nums">{{ row.isbn }}</TableCell>
          <TableCell class="whitespace-nowrap tabular-nums">{{ row.date }}</TableCell>
          <TableCell align="end" class="tabular-nums">{{ row.pages }}</TableCell>
          <TableCell align="end" class="whitespace-nowrap tabular-nums">{{ row.price }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>
</template>

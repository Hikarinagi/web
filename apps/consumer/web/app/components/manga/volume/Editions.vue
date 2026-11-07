<script setup lang="ts">
  import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hina-ui/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { dayText } from '~/features/entry/date'
  import { volumePrice } from '~/features/light-novel-volume/price'

  defineOptions({ name: 'MangaVolumeEditions' })
  const props = defineProps<{
    volume: MangaVolumePageData['volume']
    producers: MangaVolumePageData['producers']
  }>()

  const publishers = computed(
    () =>
      props.volume.publisher ||
      props.producers
        .filter(item => item.role === 'PUBLISHER')
        .map(item => item.producer.name)
        .join('、'),
  )
</script>

<template>
  <EntrySectionHead id="editions" title="出版版本" :count="1" />
  <Card :padded="false">
    <Table class="[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap">
      <TableHeader>
        <TableRow>
          <TableHead>出版社</TableHead>
          <TableHead>ISBN</TableHead>
          <TableHead>发售日</TableHead>
          <TableHead align="end">页数</TableHead>
          <TableHead align="end">价格</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell lang="ja">{{ publishers }}</TableCell>
          <TableCell class="tabular-nums">{{ volume.isbn }}</TableCell>
          <TableCell class="tabular-nums">{{ dayText(volume.publication_date) }}</TableCell>
          <TableCell align="end" class="tabular-nums">{{ volume.page_count ?? '' }}</TableCell>
          <TableCell align="end" class="tabular-nums">{{ volumePrice(volume) }}</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>
</template>

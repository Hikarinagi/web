<script setup lang="ts">
  import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { dayText } from '~/features/entry/date'
  import { volumePrice } from '~/features/light-novel-volume/price'

  defineOptions({ name: 'LightNovelVolumeEditions' })
  const props = defineProps<{
    volume: LightNovelVolumePageData['volume']
    producers: LightNovelVolumePageData['producers']
  }>()

  const publishers = computed(() =>
    [...new Set(props.producers.map(item => item.producer.name))].join('、'),
  )
</script>

<template>
  <EntrySectionHead id="editions" title="出版版本" :count="1" />
  <Card :padded="false">
    <Table>
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
          <TableCell class="whitespace-nowrap tabular-nums">
            {{ dayText(volume.publication_date) }}
          </TableCell>
          <TableCell align="end" class="tabular-nums">{{ volume.pages ?? '' }}</TableCell>
          <TableCell align="end" class="whitespace-nowrap tabular-nums">
            {{ volumePrice(volume) }}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Card>
</template>

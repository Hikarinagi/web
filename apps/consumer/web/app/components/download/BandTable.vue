<script setup lang="ts">
  import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@hina-ui/vue'

  defineOptions({ name: 'DownloadBandTable' })

  defineProps<{ novelBand: number; mangaBand: number }>()
</script>

<template>
  <Table variant="secondary" :hover="false">
    <TableHeader>
      <TableRow>
        <TableHead>轻小说</TableHead>
        <TableHead>漫画</TableHead>
        <TableHead align="end">下载卡总数</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="band in 3" :key="band">
        <TableCell>{{ (band - 1) * novelBand + 1 }}–{{ band * novelBand }} 卷</TableCell>
        <TableCell>{{ (band - 1) * mangaBand + 1 }}–{{ band * mangaBand }} 话</TableCell>
        <TableCell align="end">{{ (band * (band + 1)) / 2 }} 张</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

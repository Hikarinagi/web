<script setup lang="ts">
  import {
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import type { DownloadCards } from '~/features/download/types'

  defineProps<{ status: DownloadCards }>()
</script>

<template>
  <Question title="下载卡使用说明" aria-label="查看下载卡使用说明" size="md">
    <Stack gap="md">
      <Text size="sm">
        每月前 {{ status.novel_band_size }} 卷轻小说需要 1 张下载卡。接下来的
        {{ status.novel_band_size }} 卷轻小说还需要 2 张下载卡，接下来的
        {{ status.novel_band_size }} 卷轻小说又需要 3
        张下载卡，以此类推。对于漫画，同样的规则适用于每 {{ status.manga_band_size }} 章。
      </Text>
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
            <TableCell
              >{{ (band - 1) * status.novel_band_size + 1 }}–{{
                band * status.novel_band_size
              }}
              卷</TableCell
            >
            <TableCell
              >{{ (band - 1) * status.manga_band_size + 1 }}–{{
                band * status.manga_band_size
              }}
              章</TableCell
            >
            <TableCell align="end">{{ (band * (band + 1)) / 2 }} 张</TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <Text size="sm">
        轻小说和漫画共同参与计算。例如，当月下载轻小说 {{ status.novel_band_size }} 卷和漫画
        {{ status.manga_band_size }} 章，总共需要 3
        张下载卡。您的每月下载总量会在每个月初重置。再次下载同一文件不会再使用任何下载卡，除非该文件已更新。
      </Text>
    </Stack>
  </Question>
</template>

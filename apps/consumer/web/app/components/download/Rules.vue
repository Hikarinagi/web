<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import type { DownloadCards } from '~/features/download/types'

  defineOptions({ name: 'DownloadRules' })

  defineProps<{ status: DownloadCards }>()
</script>

<template>
  <Question title="下载卡的计算方式" aria-label="查看下载卡的计算方式" size="md">
    <Stack gap="md">
      <Text size="sm">
        每月前 {{ status.novel_band_size }} 卷轻小说需要 1 张下载卡，接下来的
        {{ status.novel_band_size }} 卷需要 2 张，再接下来的 {{ status.novel_band_size }} 卷需要 3
        张，以此类推。漫画按每 {{ status.manga_band_size }} 话套用同样的规则。
      </Text>
      <DownloadBandTable
        :novel-band="status.novel_band_size"
        :manga-band="status.manga_band_size"
      />
      <Text size="sm">
        轻小说与漫画共用相同的档位。例如当月下载轻小说 {{ status.novel_band_size }} 卷和漫画
        {{ status.manga_band_size }} 话，总共需要 3
        张下载卡。每月的计数在月初重置。再次下载相同内容不会使用下载卡，除非内容已更新。
      </Text>
    </Stack>
  </Question>
</template>

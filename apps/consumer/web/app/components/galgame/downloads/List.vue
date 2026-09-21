<script setup lang="ts">
  import { Empty, Stack } from '@hina-ui/vue'
  import { HardDriveDownload } from '@lucide/vue'
  import { useDownloadLink } from '~/features/galgame/useDownloadLink'
  import type { GalgameDownloadResource } from '~/features/galgame/download'

  defineOptions({ name: 'GalgameDownloadsList' })
  const props = defineProps<{ galgameId: number; resources: GalgameDownloadResource[] }>()

  const { pendingFileId, download, copyLink } = useDownloadLink(props.galgameId)
</script>

<template>
  <Empty v-if="!resources.length" title="暂无可下载资源" description="这部作品还没有资源上传">
    <template #icon><HardDriveDownload /></template>
  </Empty>

  <Stack v-else>
    <GalgameDownloadsResourceItem
      v-for="resource in resources"
      :key="resource.id"
      :resource="resource"
      :pending-file-id="pendingFileId"
      @download="download"
      @copy="copyLink"
    />
  </Stack>
</template>

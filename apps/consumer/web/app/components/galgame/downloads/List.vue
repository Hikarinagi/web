<script setup lang="ts">
  import { useDownloadLink } from '~/features/galgame/useDownloadLink'
  import type { GalgameDownloadResource } from '~/features/galgame/download'

  defineOptions({ name: 'GalgameDownloadsList' })
  const props = defineProps<{ galgameId: number; resources: GalgameDownloadResource[] }>()

  const { pendingFileId, download, copyLink } = useDownloadLink(props.galgameId)
</script>

<template>
  <div class="flex flex-col gap-5">
    <p
      v-if="!resources.length"
      class="rounded-xl border border-surface px-6 py-5 text-sm text-muted-color"
    >
      这部作品还没有可下载的资源
    </p>

    <GalgameDownloadsResourceItem
      v-for="resource in resources"
      :key="resource.id"
      :resource="resource"
      :pending-file-id="pendingFileId"
      @download="download"
      @copy="copyLink"
    />
  </div>
</template>

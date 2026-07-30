<script setup lang="ts">
  import { ExternalLink, HardDriveDownload } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineProps<{
    galgame: GalgamePageData['galgame']
  }>()
</script>

<template>
  <div
    v-if="galgame.homepage || galgame.download_resource_count > 0"
    class="flex flex-wrap justify-center gap-3 lg:justify-start"
  >
    <Button
      v-if="galgame.download_resource_count > 0"
      as="router-link"
      :to="`/galgames/${galgame.id}/downloads`"
      label="资源下载"
      severity="info"
      outlined
    >
      <template #icon>
        <HardDriveDownload :size="16" aria-hidden="true" />
      </template>
    </Button>

    <Button
      v-if="galgame.homepage"
      as="a"
      :href="galgame.homepage"
      target="_blank"
      rel="noopener noreferrer"
      label="官方网站"
      severity="secondary"
      outlined
    >
      <template #icon>
        <ExternalLink :size="16" aria-hidden="true" />
      </template>
    </Button>
  </div>
</template>

<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { ExternalLink, HardDriveDownload } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineProps<{
    galgame: GalgamePageData['galgame']
  }>()
</script>

<template>
  <Inline
    v-if="galgame.homepage || galgame.download_resource_count > 0"
    justify="center"
    class="lg:justify-start"
  >
    <Button
      v-if="galgame.download_resource_count > 0"
      :as="NuxtLink"
      :to="`/galgames/${galgame.id}/downloads`"
      variant="outline"
    >
      <template #icon>
        <HardDriveDownload aria-hidden="true" />
      </template>
      资源下载
    </Button>

    <Button
      v-if="galgame.homepage"
      as="a"
      :href="galgame.homepage"
      target="_blank"
      rel="noopener noreferrer"
      variant="outline"
      tone="neutral"
    >
      <template #icon>
        <ExternalLink aria-hidden="true" />
      </template>
      官方网站
    </Button>
  </Inline>
</template>

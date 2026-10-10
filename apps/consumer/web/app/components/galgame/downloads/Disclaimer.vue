<script setup lang="ts">
  import { Callout, Inline, Link, Text } from '@hina-ui/vue'
  import { storeLinks } from '~/features/galgame/download'
  import type { GalgameDownloadsPageData } from '~~/server/api/pages/galgames/[id]/downloads.get'

  defineOptions({ name: 'GalgameDownloadsDisclaimer' })
  const props = defineProps<{
    links: GalgameDownloadsPageData['galgame']['external_links']
    steamApps: GalgameDownloadsPageData['galgame']['steam_apps']
  }>()

  const stores = computed(() =>
    storeLinks([
      ...props.links,
      ...props.steamApps.map(app => ({
        name: 'steam',
        label: 'Steam',
        url: `https://store.steampowered.com/app/${app.app_id}/`,
      })),
    ]),
  )
</script>

<template>
  <Callout title="下载前须知">
    以下内容均搜集自互联网，Hikarinagi 不储存和分发任何游戏文件，如有能力请支持正版。
    <Inline v-if="stores.length" gap="sm" class="mt-2">
      <Text as="span" size="sm" tone="muted">正版购买</Text>
      <Link
        v-for="store in stores"
        :key="store.url"
        :href="store.url"
        target="_blank"
        rel="noreferrer"
      >
        {{ store.label }}
      </Link>
    </Inline>
  </Callout>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { galgameDownloadSeo } from '~/features/seo/galgame-download'

  definePageMeta({ container: 'full' })

  const route = useRoute()
  const galgameId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}/downloads`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)

  const galgameName = computed(() => {
    const g = data.value?.galgame
    return g?.trans_title || g?.origin_title || ''
  })

  const seo = computed(() => (data.value ? galgameDownloadSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '资源下载',
    headerTitle: () => seo.value?.headerTitle ?? '资源下载',
    description: () => seo.value?.description,
    card: { type: 'galgame', id: galgameId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <Stack v-if="data" gap="none" class="-mt-(--app-header-height)">
    <GalgameBand :galgame="data.galgame" :title="galgameName" heading="资源下载" />

    <Stack gap="lg" class="mx-auto w-full max-w-(--entry-container) px-4 py-8 lg:px-6">
      <GalgameDownloadsDisclaimer
        :links="data.galgame.external_links"
        :steam-apps="data.galgame.steam_apps"
      />

      <GalgameDownloadsTabs :downloads="data.downloads" :patches="data.patches" />

      <PromotionBanner v-for="banner in data.banners" :key="banner.id" :banner="banner" />
    </Stack>
  </Stack>
</template>

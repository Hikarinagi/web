<script setup lang="ts">
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  definePageMeta({
    layout: 'reader',
    floatingToolbar: false,
  })

  useHead({ htmlAttrs: { class: 'overflow-hidden overscroll-none' } })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const volumeId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/light-novel-volumes/${volumeId}/reader`, {
    fatal: true,
  })
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)

  useHikariSeoMeta({
    title: () => {
      const pageData = data.value
      if (!pageData) return '在线阅读'

      return [
        `${getLightNovelVolumeTitle(pageData.volume)} 在线阅读`,
        `${getLightNovelTitle(pageData.light_novel)} 在线阅读`,
      ]
    },
    description: () => {
      const pageData = data.value
      if (!pageData) return undefined

      return [pageData.volume.summary_cn, pageData.volume.summary]
    },
    noindex: true,
  })
</script>

<template>
  <HikariReader v-if="data" :data="data" />
</template>

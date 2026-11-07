<script setup lang="ts">
  import { lightNovelSeo } from '~/features/seo/light-novel'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const lightNovelId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/light-novels/${lightNovelId}`, {
    fatal: true,
  })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.light_novel.nsfw)
  useViewPing('light_novel', lightNovelId)

  const seo = computed(() => (data.value ? lightNovelSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? '轻小说',
    headerTitle: () => seo.value?.headerTitle ?? '轻小说',
    description: () => seo.value?.description,
    card: { type: 'light-novel', id: lightNovelId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <LightNovelPage
    v-if="data"
    :data="data"
    :light-novel-id="lightNovelId"
    class="-mt-(--app-header-height)"
  />
</template>

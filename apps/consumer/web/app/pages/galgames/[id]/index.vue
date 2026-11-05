<script setup lang="ts">
  import { galgameSeo } from '~/features/seo/galgame'
  import { useViewPing } from '~/features/interaction/useViewPing'

  definePageMeta({
    container: 'full',
  })

  const route = useRoute()
  const rawId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  const galgameId = Number(rawId)

  const { data } = await useHikariApiData(`/api/pages/galgames/${galgameId}`, { fatal: true })
  await redirectIfMerged(data)
  useNsfwDetailGate(() => data.value?.galgame.nsfw)
  useViewPing('galgame', galgameId)

  const seo = computed(() => (data.value ? galgameSeo(data.value) : null))

  useHikariSeoMeta({
    title: () => seo.value?.title ?? 'Galgame',
    headerTitle: () => seo.value?.headerTitle ?? 'Galgame',
    description: () => seo.value?.description,
    card: { type: 'galgame', id: galgameId },
    schemaOrg: seo.value?.schema,
  })
</script>

<template>
  <GalgamePage v-if="data" :data="data" :galgame-id="galgameId" class="-mt-(--app-header-height)" />
</template>

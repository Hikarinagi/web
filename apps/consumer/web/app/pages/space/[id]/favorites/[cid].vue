<script setup lang="ts">
  import type { SpaceCollectionDetailPageData } from '~~/server/api/pages/space/[id]/favorites/[cid].get'

  definePageMeta({ layout: 'default' })

  const route = useRoute()
  const ownerId = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const cid = Number(Array.isArray(route.params.cid) ? route.params.cid[0] : route.params.cid)
  const pageQuery = route.query.page
  const pageQueryValue = Array.isArray(pageQuery) ? pageQuery[0] : pageQuery
  const routePage = Number(pageQueryValue)
  const suffix = Number.isInteger(routePage) && routePage > 1 ? `?page=${routePage}` : ''
  const pageRequest =
    `/api/pages/space/${ownerId}/favorites/${cid}${suffix}` as `/api/pages/${string}`

  const { data } = await useHikariApiData<SpaceCollectionDetailPageData>(pageRequest, {
    fatal: true,
  })

  useHikariSeoMeta({
    title: () =>
      data.value
        ? [`${data.value.collection.name} · ${displayName(data.value.owner)}的收藏夹`]
        : ['收藏夹'],
    description: () => [data.value?.collection.description],
    card: { type: 'collection', id: cid },
  })
</script>

<template>
  <SpaceFavoriteCollectionDetail v-if="data" :data="data" />
</template>

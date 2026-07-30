<script setup lang="ts">
  import { CATALOG_PAGE_SIZE, type CatalogSort } from '~/features/manga/catalog'

  defineOptions({ name: 'MangaMagazinePage' })
  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/mangas/magazine/${id}`, { fatal: true })

  useHikariSeoMeta({
    title: () => (data.value ? `${data.value.masthead.name} 连载漫画一览` : '连载杂志'),
    description: () =>
      data.value
        ? `${data.value.masthead.name} 连载的全部漫画，共 ${data.value.works.meta.total_items} 部，可在 Hikarinagi 在线阅读。`
        : undefined,
  })

  function load(page: number, sort: CatalogSort) {
    return hikariRequest('/api/v3/producers/{id}/mangas', {
      path: { id },
      query: { role: 'MAGAZINE', sort, page, page_size: CATALOG_PAGE_SIZE },
    })
  }
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <MangaCatalogMasthead :masthead="data.masthead" :total="data.works.meta.total_items" />
    <MangaCatalog :initial="data.works" :total="data.works.meta.total_items" :load="load" />
  </div>
</template>

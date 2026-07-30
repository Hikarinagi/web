<script setup lang="ts">
  import { CATALOG_PAGE_SIZE, type CatalogSort } from '~/features/light-novel/catalog'

  defineOptions({ name: 'LightNovelIllustratorPage' })
  definePageMeta({ container: 'full' })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/light-novels/illustrator/${id}`, {
    fatal: true,
  })

  useHikariSeoMeta({
    title: () => (data.value ? `${data.value.masthead.name} 插画的轻小说作品一览` : '插画'),
    description: () =>
      data.value
        ? `${data.value.masthead.name} 担当插画的全部轻小说，共 ${data.value.works.meta.total_items} 部，可在 Hikarinagi 在线阅读。`
        : undefined,
  })

  function load(page: number, sort: CatalogSort) {
    return hikariRequest('/api/v3/people/{id}/light-novels', {
      path: { id },
      query: { relation: 'illustrator', sort, page, page_size: CATALOG_PAGE_SIZE },
    })
  }
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <LightNovelCatalogMasthead :masthead="data.masthead" :total="data.works.meta.total_items" />
    <LightNovelCatalog :initial="data.works" :total="data.works.meta.total_items" :load="load" />
  </div>
</template>

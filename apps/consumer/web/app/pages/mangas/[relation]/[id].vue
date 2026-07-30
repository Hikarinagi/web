<script setup lang="ts">
  import {
    CATALOG_PAGE_SIZE,
    MANGA_STAFF_CATALOGS,
    type CatalogSort,
    type MangaStaffCatalogSlug,
  } from '~/features/manga/catalog'

  defineOptions({ name: 'MangaStaffCatalogPage' })
  definePageMeta({ container: 'full' })

  const route = useRoute()
  const relation = String(route.params.relation) as MangaStaffCatalogSlug
  const catalog = MANGA_STAFF_CATALOGS[relation]
  if (!catalog) {
    throw createError({ statusCode: 404, message: '页面不存在' })
  }
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)

  const { data } = await useHikariApiData(`/api/pages/mangas/staff/${relation}/${id}`, {
    fatal: true,
  })

  useHikariSeoMeta({
    title: () => (data.value ? `${data.value.masthead.name} 的漫画作品一览` : catalog.eyebrow),
    description: () =>
      data.value
        ? `${data.value.masthead.name} 以${catalog.eyebrow}身份参与的漫画，共 ${data.value.works.meta.total_items} 部。`
        : undefined,
  })

  function load(page: number, sort: CatalogSort) {
    return hikariRequest('/api/v3/people/{id}/mangas', {
      path: { id },
      query: { role: catalog.role, sort, page, page_size: CATALOG_PAGE_SIZE },
    })
  }
</script>

<template>
  <div v-if="data" class="-mt-(--app-header-height)">
    <MangaCatalogMasthead :masthead="data.masthead" :total="data.works.meta.total_items" />
    <MangaCatalog :initial="data.works" :total="data.works.meta.total_items" :load="load" />
  </div>
</template>

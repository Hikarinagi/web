<script setup lang="ts">
  import type { ProductEditPageData } from '~~/server/api/pages/create/edit/product/[id].get'

  definePageMeta({ title: '编辑条目', middleware: 'wiki-editor-content-limit' })

  const route = useRoute()
  const id = Number(route.params.id)

  const { data, refresh } = await useHikariApiData<ProductEditPageData>(
    `/api/pages/create/edit/product/${id}`,
    { fatal: true },
  )
</script>

<template>
  <CreatorEntryProductEditor v-if="data" :page-data="data" @saved="refresh()" />
</template>

<script setup lang="ts">
  defineOptions({ name: 'DevelopersReferencePage' })
  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData('/api/pages/developers/reference', { fatal: true })

  useHikariSeoMeta({
    title: 'API 文档・开发者平台',
    description: () => 'Hikarinagi 公开数据 API 参考文档：条目数据端点、鉴权方式与响应结构',
  })
</script>

<template>
  <DeveloperReferenceViewer v-if="data" :issuer="data.issuer" />
</template>

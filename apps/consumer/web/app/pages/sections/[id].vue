<script setup lang="ts">
  import type { SectionPageData } from '~~/server/api/pages/sections/[id].get'

  defineOptions({ name: 'PageSectionDetail' })
  definePageMeta({ footer: false })

  const route = useRoute()
  const id = Number(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
  const { data } = await useHikariApiData<SectionPageData>(`/api/pages/sections/${id}`, {
    fatal: true,
  })

  useHikariSeoMeta({
    title: () => (data.value ? [data.value.section.name, '板块'] : '板块'),
    description: () =>
      data.value
        ? [
            data.value.section.description,
            `${data.value.section.name} 板块的最新内容与社区讨论。在 Hikarinagi 浏览 ${data.value.section.name} 板块吧！`,
          ]
        : undefined,
  })
</script>

<template>
  <SectionDetail v-if="data" :initial="data" :section-id="id" />
</template>

<script setup lang="ts">
  import type { SearchPageData } from '~~/server/api/pages/search.get'
  import { readSearchQuery, searchBff } from '~/features/search/results'

  defineOptions({ name: 'SearchPage' })
  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const { data } = await useHikariApiData<SearchPageData>(searchBff(readSearchQuery(route.query)), {
    fatal: true,
    watch: false,
  })

  useHikariSeoMeta({
    title: () => {
      const q = readSearchQuery(route.query).q
      return q ? [`${q} · 搜索`, '搜索'] : '搜索'
    },
    description: () => '搜索 Hikarinagi 数据库中的作品、角色、人物与厂商。',
  })
</script>

<template>
  <SearchResultsShell v-if="data" :initial="data" />
</template>

<script setup lang="ts">
  import type { MangasBrowsePageData } from '~~/server/api/pages/mangas/browse.get'
  import {
    browseBff,
    browseRoute,
    readBrowseQuery,
    type MangaBrowseState,
  } from '~/features/manga/explore'

  defineOptions({ name: 'MangasBrowsePage' })
  definePageMeta({ container: 'full', scrollToTop: true, middleware: 'browse-search' })

  const route = useRoute()
  const router = useRouter()
  const state = computed(() => readBrowseQuery(route.query))
  const request = computed(() => browseBff(state.value))
  const { data, pending } = await useHikariApiData<MangasBrowsePageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(next: Partial<MangaBrowseState>) {
    void router.push(browseRoute({ ...state.value, ...next, page: next.page ?? 1 }))
  }

  useHikariSeoMeta({
    title: '漫画图鉴',
    headerTitle: '漫画',
    description: '按标签、连载状态与开始年份浏览漫画，找到你感兴趣的作品！',
  })
</script>

<template>
  <MangaBrowseShell v-if="data" :data="data" :pending="pending" :state="state" @update="update" />
</template>

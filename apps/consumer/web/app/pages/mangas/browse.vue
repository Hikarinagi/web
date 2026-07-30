<script setup lang="ts">
  import type { MangasBrowsePageData } from '~~/server/api/pages/mangas/browse.get'
  import {
    browseBff,
    browseRoute,
    readBrowseQuery,
    type MangaBrowseState,
  } from '~/features/manga/explore'

  defineOptions({ name: 'MangasBrowsePage' })
  definePageMeta({ container: 'full', scrollToTop: true })

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
    title: () =>
      state.value.search ? [`${state.value.search} · 漫画图鉴`, '漫画图鉴'] : '漫画图鉴',
    description: () => '按更新时间、地区、受众与连载状态浏览漫画图鉴，找到你感兴趣的作品！',
  })
</script>

<template>
  <MangaBrowseShell v-if="data" :data="data" :pending="pending" :state="state" @update="update" />
</template>

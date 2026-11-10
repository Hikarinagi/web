<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import {
    browseBff,
    browseRoute,
    readBrowseQuery,
    type LightNovelBrowseState,
  } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelsBrowsePage' })
  definePageMeta({ container: 'full', scrollToTop: true, middleware: 'browse-search' })

  const route = useRoute()
  const router = useRouter()
  const state = computed(() => readBrowseQuery(route.query))
  const request = computed(() => browseBff(state.value))
  const { data, pending } = await useHikariApiData<LightNovelsBrowsePageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(next: Partial<LightNovelBrowseState>) {
    void router.push(browseRoute({ ...state.value, ...next, page: next.page ?? 1 }))
  }

  useHikariSeoMeta({
    title: '轻小说图鉴',
    headerTitle: '轻小说',
    description: '按标签、开始年份与文库浏览轻小说，找到你感兴趣的作品！',
  })
</script>

<template>
  <LightNovelBrowseShell
    v-if="data"
    :data="data"
    :pending="pending"
    :state="state"
    @update="update"
  />
</template>

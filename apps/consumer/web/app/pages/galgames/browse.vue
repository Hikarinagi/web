<script setup lang="ts">
  import type { GalgamesBrowsePageData } from '~~/server/api/pages/galgames/browse.get'
  import {
    browseBff,
    browseRoute,
    readBrowseQuery,
    type GalgameBrowseState,
  } from '~/features/galgame/explore'

  defineOptions({ name: 'GalgamesBrowsePage' })
  definePageMeta({ container: 'full', scrollToTop: true })

  const route = useRoute()
  const router = useRouter()
  const state = computed(() => readBrowseQuery(route.query))
  const request = computed(() => browseBff(state.value))
  const { data, pending } = await useHikariApiData<GalgamesBrowsePageData>(request, {
    fatal: true,
    watch: [request],
  })

  function update(next: Partial<GalgameBrowseState>) {
    void router.push(browseRoute({ ...state.value, ...next, page: next.page ?? 1 }))
  }

  useHikariSeoMeta({
    title: () => (state.value.search ? [`${state.value.search} · 图鉴`, '图鉴'] : '图鉴'),
    description: () =>
      '按发售日、更新时间、标签与关键词浏览 Galgame・视觉小说图鉴，找到你感兴趣的作品！',
  })
</script>

<template>
  <GalgameBrowseShell v-if="data" :data="data" :pending="pending" :state="state" @update="update" />
</template>

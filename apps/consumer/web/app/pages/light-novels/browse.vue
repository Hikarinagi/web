<script setup lang="ts">
  import type { LightNovelsBrowsePageData } from '~~/server/api/pages/light-novels/browse.get'
  import {
    browseBff,
    browseRoute,
    readBrowseQuery,
    type LightNovelBrowseState,
  } from '~/features/light-novel/explore'

  defineOptions({ name: 'LightNovelsBrowsePage' })
  definePageMeta({ container: 'full', scrollToTop: true })

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
    title: () => (state.value.search ? [`${state.value.search} · 图鉴`, '图鉴'] : '图鉴'),
    description: () => '按发售日、更新时间、标签与关键词浏览轻小说图鉴，找到你感兴趣的作品！',
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

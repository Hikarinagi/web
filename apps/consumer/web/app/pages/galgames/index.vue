<script setup lang="ts">
  import type { GalgamesPageData } from '~~/server/api/pages/galgames.get'

  defineOptions({ name: 'GalgamesPage' })
  definePageMeta({ container: 'full', footer: false })

  const auth = useAuthStore()
  const { data, refresh } = await useHikariApiData<GalgamesPageData>('/api/pages/galgames', {
    fatal: true,
  })
  watch(
    () => auth.isAuthenticated,
    () => refresh(),
  )

  useHikariSeoMeta({
    title: 'Galgame・视觉小说图鉴',
    description: () =>
      '浏览超全的 Galgame・视觉小说数据库，收录作品介绍、发售信息、角色 CV、Staff，以及大家的评价。记录你的游玩状态，写下你的犀利吐槽吧！',
  })
</script>

<template>
  <LandingGalgamePage v-if="data" :data="data" />
</template>

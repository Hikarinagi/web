<script setup lang="ts">
  import type { MangasPageData } from '~~/server/api/pages/mangas.get'

  defineOptions({ name: 'MangasPage' })
  definePageMeta({ container: 'full', footer: false })

  const auth = useAuthStore()
  const { data, refresh } = await useHikariApiData<MangasPageData>('/api/pages/mangas', {
    fatal: true,
  })
  watch(
    () => auth.isAuthenticated,
    () => refresh(),
  )

  useHikariSeoMeta({
    title: '漫画',
    description: () =>
      '在线浏览漫画库，收录连载与完结漫画的作品信息、章节更新与连载杂志，找到你下一部想看的漫画。',
  })
</script>

<template>
  <LandingMangaPage v-if="data" :data="data" />
</template>

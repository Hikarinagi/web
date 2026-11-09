<script setup lang="ts">
  import type { LightNovelsPageData } from '~~/server/api/pages/light-novels.get'

  defineOptions({ name: 'LightNovelsPage' })
  definePageMeta({ container: 'full', footer: false })

  const auth = useAuthStore()
  const { data, refresh } = await useHikariApiData<LightNovelsPageData>('/api/pages/light-novels', {
    fatal: true,
  })
  watch(
    () => auth.isAuthenticated,
    () => refresh(),
  )

  useHikariSeoMeta({
    title: '轻小说在线阅读',
    description: () =>
      '免费在线阅读轻小说，收录轻小说系列、文库、作者与各卷发售信息，支持章节在线阅读。',
  })
</script>

<template>
  <LandingLightNovelPage v-if="data" :data="data" />
</template>

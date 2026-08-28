<script setup lang="ts">
  import type { AppPageData } from '~~/server/api/pages/app.get'

  defineOptions({ name: 'AppPage' })

  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData<AppPageData>('/api/pages/app', { fatal: true })

  useHikariSeoMeta({
    title: '下载 App',
    description: () =>
      '下载 Hikarinagi 手机客户端，刷同好发的图文，追在看的漫画和小说，随时随地继续阅读。',
  })
</script>

<template>
  <AppHero
    v-if="data"
    class="-mt-(--app-header-height)"
    :release="data.release"
    :android-qr="data.android_qr"
  />
</template>

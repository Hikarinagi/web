<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'

  defineOptions({ name: 'DevelopersPage' })
  definePageMeta({ container: 'full' })

  useHikariSeoMeta({
    title: '开发者平台',
    description: () =>
      '用 Hikarinagi 的公开数据构建你的应用：Galgame、轻小说、漫画条目数据 API，自助创建应用、获取访问令牌，即刻开始',
  })
</script>

<template>
  <Stack gap="none" class="-mt-(--app-header-height)">
    <DeveloperLandingHero />

    <Stack gap="none" class="px-6 py-14">
      <Stack gap="none" class="mx-auto w-full max-w-app">
        <DeveloperLandingFlow />
      </Stack>
    </Stack>
  </Stack>
</template>

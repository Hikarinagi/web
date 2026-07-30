<script setup lang="ts">
  defineOptions({ name: 'DevelopersPage' })
  definePageMeta({ container: 'full' })

  useHikariSeoMeta({
    title: '开发者平台',
    description: () =>
      '用 Hikarinagi 的公开数据构建你的应用：Galgame、轻小说、漫画条目数据 API，自助创建应用、获取访问令牌，即刻开始',
  })
</script>

<template>
  <div class="-mt-(--app-header-height)">
    <DeveloperLandingHero />

    <div class="mx-auto box-content flex max-w-app flex-col gap-14 px-6 py-12">
      <DeveloperLandingSteps />
    </div>
  </div>
</template>

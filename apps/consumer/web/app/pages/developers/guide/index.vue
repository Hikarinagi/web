<script setup lang="ts">
  import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbSeparator,
    Page,
    PageBody,
    PageHeader,
    Stack,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { useGuideNav } from '~/features/developer/useGuide'

  defineOptions({ name: 'DevelopersGuideIndexPage' })
  definePageMeta({ layout: 'developers', container: 'full', scrollToTop: true })

  const { data: sections } = await useGuideNav()

  useHikariSeoMeta({
    title: '接入指南',
    description: () =>
      'Hikarinagi 开放平台接入指南：授权方式、授权码 + PKCE 流程、scope 目录、令牌生命周期、响应约定与品牌署名',
  })
</script>

<template>
  <Page size="lg">
    <Stack gap="sm">
      <Breadcrumb>
        <BreadcrumbItem :as="NuxtLink" to="/developers">开发者平台</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem current>接入指南</BreadcrumbItem>
      </Breadcrumb>

      <PageHeader
        title="接入指南"
        description="读取公开条目数据，或在用户授权后代表用户进行数据读写。"
      />
    </Stack>
    <PageBody>
      <DeveloperGuideList :sections="sections ?? []" />
    </PageBody>
  </Page>
</template>

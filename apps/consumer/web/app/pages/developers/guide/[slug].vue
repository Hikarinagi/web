<script setup lang="ts">
  import {
    Anchor,
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbSeparator,
    Page,
    PageAside,
    PageBody,
    PageHeader,
    Stack,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { provideGuideData } from '~/features/developer/guideContext'
  import { useGuideDoc, useGuideNav } from '~/features/developer/useGuide'
  import type { DevelopersGuidePageData } from '~~/server/api/pages/developers/guide.get'

  defineOptions({ name: 'DevelopersGuidePage' })
  definePageMeta({
    layout: 'developers',
    container: 'full',
    scrollToTop: true,
    key: route => route.path,
  })

  const route = useRoute()
  const { data: doc } = await useGuideDoc(route.path)
  if (!doc.value) throw createError({ statusCode: 404, message: '文档不存在', fatal: true })

  const { data: sections } = await useGuideNav()

  const { data } = await useHikariApiData<DevelopersGuidePageData>('/api/pages/developers/guide', {
    fatal: true,
    watch: false,
  })
  provideGuideData(data)

  const toc = computed(() =>
    (doc.value?.body.toc?.links ?? []).map(link => ({ id: link.id, label: link.text })),
  )

  useHikariSeoMeta({
    title: () => doc.value?.title ?? '接入指南',
    description: () => doc.value?.description ?? '',
  })
</script>

<template>
  <Page v-if="doc" size="lg">
    <Stack gap="sm">
      <Breadcrumb>
        <BreadcrumbItem :as="NuxtLink" to="/developers">开发者平台</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem :as="NuxtLink" to="/developers/guide">接入指南</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem current>{{ doc.title }}</BreadcrumbItem>
      </Breadcrumb>

      <PageHeader :title="doc.title" :description="doc.description" />
    </Stack>

    <PageBody>
      <DeveloperGuideBody :doc />
      <DeveloperGuidePrevNext :sections="sections ?? []" :section="doc.section" />
    </PageBody>

    <template v-if="toc.length" #aside>
      <PageAside label="本页目录" class="[&>div]:top-[calc(var(--app-header-height)+2rem)]">
        <Anchor :items="toc" />
      </PageAside>
    </template>
  </Page>
</template>

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
  import type { DevelopersApiIndexPageData } from '~~/server/api/pages/developers/api/index.get'

  defineOptions({ name: 'DevelopersApiIndexPage' })
  definePageMeta({ layout: 'developers', container: 'full', scrollToTop: true })

  const { data } = await useHikariApiData<DevelopersApiIndexPageData>('/api/pages/developers/api', {
    fatal: true,
    watch: false,
  })

  const groups = computed(() => {
    const byTag = new Map<
      string,
      { title: string; entries: DevelopersApiIndexPageData['entries'] }
    >()
    for (const entry of data.value?.entries ?? []) {
      const group = byTag.get(entry.tag) ?? { title: entry.groupTitle, entries: [] }
      group.entries.push(entry)
      byTag.set(entry.tag, group)
    }
    return [...byTag.entries()].map(([tag, group]) => ({ tag, ...group }))
  })

  useHikariSeoMeta({
    title: '端点参考',
    description: () => '开放 API 的全部端点。',
  })
</script>

<template>
  <Page v-if="data" size="lg">
    <Stack gap="sm">
      <Breadcrumb>
        <BreadcrumbItem :as="NuxtLink" to="/developers">开发者平台</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem current>端点参考</BreadcrumbItem>
      </Breadcrumb>

      <PageHeader title="端点参考" />
    </Stack>
    <PageBody>
      <DeveloperReferenceIntro />
      <DeveloperApiGroupList v-for="group in groups" :key="group.tag" :group="group" />
    </PageBody>
  </Page>
</template>

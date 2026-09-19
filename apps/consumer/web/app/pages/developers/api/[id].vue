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
  import type { DevelopersApiOperationPageData } from '~~/server/api/pages/developers/api/[id].get'

  defineOptions({ name: 'DevelopersApiOperationPage' })
  definePageMeta({ layout: 'developers', container: 'full', scrollToTop: true })

  const route = useRoute()
  const id = computed(() => String(route.params.id ?? ''))

  const { data } = await useHikariApiData<DevelopersApiOperationPageData>(
    () => `/api/pages/developers/api/${id.value}`,
    { fatal: true, watch: false },
  )

  const toc = computed(() => {
    if (!data.value) return []
    const operation = data.value.operation
    return [
      { id: 'playground', label: '调试' },
      ...(operation.params.some(param => param.in === 'query')
        ? [{ id: 'params', label: '查询参数' }]
        : []),
      ...(operation.request?.length ? [{ id: 'request', label: '请求体' }] : []),
      ...(operation.response?.length ? [{ id: 'response', label: '响应字段' }] : []),
      { id: 'example', label: '示例' },
      ...(operation.statuses.length ? [{ id: 'statuses', label: '响应状态' }] : []),
    ]
  })

  useHikariSeoMeta({
    title: () => data.value?.operation.summary ?? '端点参考',
    description: () =>
      data.value
        ? `${data.value.operation.method} ${data.value.operation.path} —— ${data.value.operation.summary ?? ''}`
        : '',
  })
</script>

<template>
  <Page v-if="data" size="lg">
    <Stack gap="sm">
      <Breadcrumb>
        <BreadcrumbItem :as="NuxtLink" to="/developers">开发者平台</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem :as="NuxtLink" to="/developers/api">端点参考</BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem :as="NuxtLink" :to="`/developers/api#${data.group.tag}`">
          {{ data.group.title }}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem current>{{ data.operation.summary }}</BreadcrumbItem>
      </Breadcrumb>

      <PageHeader :title="data.operation.summary" :description="data.operation.description">
        <DeveloperApiEndpointLine :operation="data.operation" :auth="data.group.auth" />
      </PageHeader>
    </Stack>

    <PageBody>
      <DeveloperApiSections :data="data" />
      <DeveloperApiPrevNext :prev="data.prev" :next="data.next" />
    </PageBody>

    <template #aside>
      <PageAside label="本页目录" class="[&>div]:top-[calc(var(--app-header-height)+2rem)]">
        <Anchor :items="toc" />
      </PageAside>
    </template>
  </Page>
</template>

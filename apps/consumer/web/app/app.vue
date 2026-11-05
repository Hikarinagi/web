<script setup lang="ts">
  import { TooltipProvider } from '@hina-ui/vue'
  import { MotionConfig } from 'motion-v'
  import type { RouteLocationNormalizedLoaded } from 'vue-router'
  import HikariProvider from './provider.vue'
  import { SITE_CONFIG } from '~/config/site'
  import { TRANSITION } from '~/lib/motion'

  useHikariSeoMeta({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    appendSiteName: false,
  })

  const route = useRoute()
  const tabs = useCreatorTabsStore()
  const creator = computed(() => route.meta.layout === 'creator')
  const keepalive = computed(() => (creator.value ? { max: 12 } : { include: ['HomePage'] }))
  const creatorKey = (page: RouteLocationNormalizedLoaded) =>
    page.path.startsWith('/create')
      ? '/create'
      : `${tabs.pageKey(page.path)}:${String(page.matched[0]?.name ?? '')}`

  useSchemaOrg([
    defineWebSite({
      name: SITE_CONFIG.name,
      potentialAction: [defineSearchAction({ target: '/search?q={search_term_string}' })],
    }),
  ])
</script>

<template>
  <MotionConfig :transition="TRANSITION" reduced-motion="user">
    <TooltipProvider>
      <HikariProvider />
      <NuxtErrorBoundary>
        <ErrorRecoverableGuard>
          <NuxtLayout>
            <NuxtPage :keepalive="keepalive" :page-key="creator ? creatorKey : undefined" />
          </NuxtLayout>
        </ErrorRecoverableGuard>
        <template #error="{ error, clearError: reset }">
          <ErrorPage :error="error" :reset="reset" :show-header="false" />
        </template>
      </NuxtErrorBoundary>
      <MediaLibrary />
    </TooltipProvider>
  </MotionConfig>
</template>

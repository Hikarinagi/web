<script setup lang="ts">
  import { MotionConfig } from 'motion-v'
  import HikariProvider from './provider.vue'
  import { SITE_CONFIG } from '~/config/site'
  import { TRANSITION } from '~/lib/motion'

  useHikariSeoMeta({
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    appendSiteName: false,
  })

  useSchemaOrg([
    defineWebSite({
      name: SITE_CONFIG.name,
      potentialAction: [defineSearchAction({ target: '/search?q={search_term_string}' })],
    }),
  ])
</script>

<template>
  <MotionConfig :transition="TRANSITION" reduced-motion="user">
    <HikariProvider />
    <NuxtErrorBoundary>
      <ErrorRecoverableGuard>
        <NuxtLayout>
          <NuxtPage :keepalive="{ include: ['HomePage'] }" />
        </NuxtLayout>
      </ErrorRecoverableGuard>
      <template #error="{ error, clearError: reset }">
        <ErrorPage :error="error" :reset="reset" :show-header="false" />
      </template>
    </NuxtErrorBoundary>
    <MediaLibrary />
  </MotionConfig>
</template>

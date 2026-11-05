<script setup lang="ts">
  import type { RouteLocationNormalizedLoaded } from 'vue-router'

  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
  })

  const route = useRoute()
  const tabs = useCreatorTabsStore()
  const keepalive = computed(() => (route.meta.layout === 'creator' ? { max: 12 } : undefined))
  const pageKey = (page: RouteLocationNormalizedLoaded) =>
    `${tabs.pageKey(page.path)}:${String(page.matched[1]?.name ?? '')}`
</script>

<template>
  <NuxtPage :keepalive="keepalive" :page-key="pageKey" />
</template>

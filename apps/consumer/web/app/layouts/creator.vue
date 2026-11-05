<script setup lang="ts">
  import { AppShell, SidebarTrigger, Stack, VisuallyHidden } from '@hina-ui/vue'
  import { useCreatorSidebar } from '~/features/creator/composables/useCreatorSidebar'
  import { cn } from '~/utils/cn'

  const { state } = useCreatorSidebar()
  const route = useRoute()
  const title = computed(() => (route.meta.title as string | undefined) ?? '创作者中心')
</script>

<template>
  <AppShell v-model:sidebar="state" mobile-title="创作者中心" restore-key="creator">
    <template #sidebar><CreatorShellSidebar /></template>
    <template #header>
      <SidebarTrigger />
      <CreatorShellTabStrip />
    </template>

    <Stack gap="md" :class="cn('px-5 py-4', route.meta.fill ? 'h-full' : 'min-h-full')">
      <VisuallyHidden as="h1">{{ title }}</VisuallyHidden>
      <CreatorShellCrumbs />
      <slot />
    </Stack>
    <CreatorShellFinder />
  </AppShell>
</template>

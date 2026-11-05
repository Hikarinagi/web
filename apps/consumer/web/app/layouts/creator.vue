<script setup lang="ts">
  import {
    AppShell,
    Inline,
    LoadingOverlay,
    ScrollArea,
    SidebarTrigger,
    Stack,
    VisuallyHidden,
  } from '@hina-ui/vue'
  import { useCreatorSidebar } from '~/features/creator/composables/useCreatorSidebar'
  import type { ComponentPublicInstance } from 'vue'
  import { SITE_CONFIG } from '~/config/site'
  import { cn } from '~/utils/cn'
  import { buildSeoTitle } from '~/utils/seo'

  const { state } = useCreatorSidebar()
  const route = useRoute()
  const title = computed(() => (route.meta.title as string | undefined) ?? '创作者中心')
  const content = useTemplateRef<ComponentPublicInstance>('content')
  useTabRouter()
  useTabLinks()
  useTabScroll(() => content.value?.$el as HTMLElement | undefined)
  const tabs = useCreatorTabsStore()
  const router = useRouter()
  const mounted = useMounted()
  const pending = useCreatorLoading()
  const loading = computed(
    () => mounted.value && [...pending.values()].includes(router.currentRoute.value.path),
  )
  useHead({
    title: () => buildSeoTitle(tabs.active?.title || title.value, SITE_CONFIG.name),
  })
</script>

<template>
  <AppShell v-model:sidebar="state" mobile-title="创作者中心" restore-key="creator">
    <template #sidebar><CreatorShellSidebar /></template>
    <template #header>
      <SidebarTrigger />
      <CreatorShellTabStrip />
    </template>

    <Stack gap="none" class="h-full min-h-0">
      <VisuallyHidden as="h1">{{ title }}</VisuallyHidden>
      <Inline
        gap="sm"
        align="center"
        :wrap="false"
        class="h-10 shrink-0 border-b border-line bg-canvas px-4 max-md:px-2"
      >
        <CreatorShellCrumbs />
      </Inline>
      <Stack gap="none" class="relative min-h-0 flex-1">
        <ScrollArea class="min-h-0 flex-1">
          <Stack
            ref="content"
            gap="lg"
            :class="cn(route.meta.fill ? 'h-full' : 'min-h-full px-6 py-6 max-md:px-4')"
          >
            <slot />
          </Stack>
        </ScrollArea>
        <LoadingOverlay :visible="loading" />
      </Stack>
    </Stack>
    <CreatorShellFinder />
  </AppShell>
</template>

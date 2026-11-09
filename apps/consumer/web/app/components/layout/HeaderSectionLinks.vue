<script setup lang="ts">
  import { Button, IconButton, Inline } from '@hina-ui/vue'
  import { SlidersHorizontal } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'LayoutHeaderSectionLinks' })

  const route = useRoute()
  const auth = useAuthStore()
  const browse = computed(() =>
    ['/galgames', '/light-novels', '/mangas'].includes(route.path) ? `${route.path}/browse` : null,
  )
</script>

<template>
  <Inline
    v-if="browse"
    gap="xs"
    align="center"
    :wrap="false"
    :class="auth.isAuthenticated ? '' : 'lg:max-xl:hidden'"
  >
    <Button
      :as="NuxtLink"
      :to="browse"
      variant="ghost"
      tone="neutral"
      size="sm"
      class="hidden xl:inline-flex"
    >
      <template #icon><SlidersHorizontal /></template>
      图鉴
    </Button>
    <IconButton :as="NuxtLink" :to="browse" label="图鉴" pill class="xl:hidden">
      <SlidersHorizontal />
    </IconButton>
  </Inline>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  const props = defineProps<{
    cover: GalgamePageData['galgame']['covers'][number]['media'] | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <Stack
    gap="none"
    data-galgame-hero-cover
    class="relative mx-auto shrink-0"
    :style="{ width: layout.width }"
  >
    <Stack
      gap="none"
      class="rounded-lg border border-white/80 bg-white/70 p-2 shadow-hikari-cover dark:border-white/10 dark:bg-surface/72 dark:shadow-black/40"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="rounded-md bg-inset"
        :ratio="layout.ratio"
        image-class="object-contain"
        :processing="layout.processing"
        :preload="{ fetchPriority: 'high' }"
        preview
      />
    </Stack>
    <slot />
  </Stack>
</template>

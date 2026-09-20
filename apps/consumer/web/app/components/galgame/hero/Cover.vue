<script setup lang="ts">
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  const props = defineProps<{
    cover: GalgamePageData['galgame']['covers'][number]['media'] | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <div data-galgame-hero-cover class="relative mx-auto shrink-0" :style="{ width: layout.width }">
    <div
      class="rounded-lg border border-white/80 bg-white/70 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-surface-900/72 dark:shadow-black/40"
    >
      <HikariImage
        :src="cover"
        :alt="title"
        class="rounded-md bg-surface-950/5 dark:bg-surface-0/5"
        :style="{ aspectRatio: layout.aspectRatio }"
        image-class="object-contain"
        :processing="layout.processing"
        :preload="{ fetchPriority: 'high' }"
        preview
      />
    </div>
    <slot />
  </div>
</template>

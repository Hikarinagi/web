<script setup lang="ts">
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  const props = defineProps<{
    cover: LightNovelPageData['light_novel']['covers'][number]['media'] | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <div class="relative mx-auto w-48 shrink-0 sm:w-56">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-[0_14px_44px_rgba(15,23,42,0.22)] ring-1 ring-black/5 dark:ring-white/10"
      :style="{ aspectRatio: layout.aspectRatio }"
      image-class="object-cover"
      :processing="layout.processing"
      :preload="{ fetchPriority: 'high' }"
      preview
    />
    <slot />
  </div>
</template>

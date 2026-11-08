<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { LightNovelPageData } from '~~/server/api/pages/light-novels/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  const props = defineProps<{
    cover: LightNovelPageData['light_novel']['covers'][number]['media'] | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <Stack gap="none" class="relative mx-auto w-48 shrink-0 sm:w-56">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-xl ring-1 ring-line"
      :ratio="layout.ratio"
      image-class="object-cover"
      :processing="layout.processing"
      :preload="{ fetchPriority: 'high' }"
      preview
    />
    <slot />
  </Stack>
</template>

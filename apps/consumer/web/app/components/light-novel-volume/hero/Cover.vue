<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { LightNovelVolumePageData } from '~~/server/api/pages/light-novel-volumes/[id].get'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'LightNovelVolumeHeroCover' })
  const props = defineProps<{
    cover:
      | LightNovelVolumePageData['volume']['covers'][number]['media']
      | LightNovelVolumePageData['light_novel']['covers'][number]['media']
      | null
    title: string
  }>()

  const layout = computed(() => getCoverMediaLayout(props.cover))
</script>

<template>
  <Stack gap="none" class="relative mx-auto w-44 shrink-0 sm:w-52">
    <HikariImage
      :src="cover"
      :alt="title"
      class="rounded-xl shadow-hikari-cover-sm ring-1 ring-black/5 dark:ring-white/10"
      :ratio="layout.ratio"
      image-class="object-cover"
      :processing="layout.processing"
      :preload="{ fetchPriority: 'high' }"
      preview
    />
    <slot />
  </Stack>
</template>

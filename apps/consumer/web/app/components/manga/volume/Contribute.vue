<script setup lang="ts">
  import { BookUp } from '@lucide/vue'
  import type { MangaVolumePageData } from '~~/server/api/pages/manga-volumes/[id].get'
  import { getMangaVolumeTitle } from '~/utils/media/manga'

  defineOptions({ name: 'MangaVolumeContribute' })
  const props = withDefaults(
    defineProps<{
      volume: MangaVolumePageData['volume']
      size?: 'sm' | 'md' | 'lg'
      variant?: 'solid' | 'soft'
    }>(),
    { size: 'md', variant: 'solid' },
  )

  const open = ref(false)
  const series = computed(() => ({
    id: props.volume.manga.id,
    title: props.volume.manga.name_cn || props.volume.manga.name,
  }))
  const target = computed(() => ({ id: props.volume.id, label: getMangaVolumeTitle(props.volume) }))
</script>

<template>
  <Button login-required :variant="variant" tone="neutral" :size="size" @click="open = true">
    <template #icon><BookUp /></template>
    投稿本卷
  </Button>
  <ContributeMangaStartDialog
    v-model:open="open"
    :series="series"
    :volume="target"
    scope="VOLUME"
  />
</template>

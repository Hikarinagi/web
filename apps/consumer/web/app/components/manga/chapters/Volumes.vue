<script setup lang="ts">
  import { BookCopy, ChevronDown } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getMangaVolumeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaChaptersVolumes' })

  const COLLAPSED_COUNT = 16

  const props = defineProps<{
    volumes: MangaPageData['volumes']
  }>()

  const expanded = ref(false)
  const visible = computed(() =>
    expanded.value ? props.volumes : props.volumes.slice(0, COLLAPSED_COUNT),
  )
  const hasMore = computed(() => props.volumes.length > COLLAPSED_COUNT)

  const yearOf = (volume: MangaPageData['volumes'][number]) =>
    volume.publication_date ? `${volume.publication_date.slice(0, 4)} 年` : ''
</script>

<template>
  <CardPanel
    title="单行本"
    :icon="BookCopy"
    :count="volumes.length"
    :description="`共 ${volumes.length} 卷`"
  >
    <div class="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-8">
      <NuxtLink
        v-for="volume in visible"
        :key="volume.id"
        :to="`/manga-volumes/${volume.id}`"
        class="group flex flex-col gap-1.5 outline-none"
      >
        <HikariImage
          :src="volume.cover"
          :alt="getMangaVolumeLabel(volume)"
          class="aspect-7/10 rounded-lg ring-1 ring-surface-200 transition-shadow duration-200 group-hover:shadow-lg group-focus-visible:ring-2 group-focus-visible:ring-primary dark:ring-surface-800"
          image-class="object-cover"
          :processing="{ width: 360, quality: 88, fit: 'cover' }"
        >
          <template #empty><MangaCoverFallback :title="getMangaVolumeLabel(volume)" /></template>
          <template #error><MangaCoverFallback :title="getMangaVolumeLabel(volume)" /></template>
        </HikariImage>
        <div class="flex flex-col">
          <p class="truncate text-xs font-medium text-color">{{ getMangaVolumeLabel(volume) }}</p>
          <p v-if="yearOf(volume)" class="truncate text-xs text-muted-color">
            {{ yearOf(volume) }}
          </p>
        </div>
      </NuxtLink>
    </div>

    <div v-if="hasMore && !expanded" class="mt-3 flex justify-center">
      <Button
        text
        severity="secondary"
        size="small"
        :label="`全部 ${volumes.length} 卷`"
        @click="expanded = true"
      >
        <template #icon><ChevronDown class="size-4" /></template>
      </Button>
    </div>
  </CardPanel>
</template>

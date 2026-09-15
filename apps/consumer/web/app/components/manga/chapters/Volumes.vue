<script setup lang="ts">
  import { Button, Center, Grid, Panel, Stack, Text } from '@hina-ui/vue'
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
  <Panel title="单行本" :count="volumes.length" :description="`共 ${volumes.length} 卷`">
    <template #icon><BookCopy /></template>
    <Grid :cols="3" class="gap-3 sm:grid-cols-5 lg:grid-cols-8">
      <NuxtLink
        v-for="volume in visible"
        :key="volume.id"
        :to="`/manga-volumes/${volume.id}`"
        class="group flex hn-interactive flex-col gap-1.5 rounded-lg hn-press-none"
      >
        <HikariImage
          :src="volume.cover"
          :alt="getMangaVolumeLabel(volume)"
          class="aspect-7/10 rounded-lg ring-1 ring-line"
          image-class="object-cover"
          :processing="{ width: 360, quality: 88, fit: 'cover' }"
        >
          <template #empty><MangaCoverFallback :title="getMangaVolumeLabel(volume)" /></template>
          <template #error><MangaCoverFallback :title="getMangaVolumeLabel(volume)" /></template>
        </HikariImage>
        <Stack gap="none">
          <Text
            size="xs"
            weight="medium"
            truncate
            class="transition-colors group-hover:text-accent-text"
          >
            {{ getMangaVolumeLabel(volume) }}
          </Text>
          <Text v-if="yearOf(volume)" size="xs" tone="muted" truncate>{{ yearOf(volume) }}</Text>
        </Stack>
      </NuxtLink>
    </Grid>

    <Center v-if="hasMore && !expanded" class="mt-3">
      <Button variant="ghost" tone="neutral" size="sm" @click="expanded = true">
        <template #icon><ChevronDown /></template>
        全部 {{ volumes.length }} 卷
      </Button>
    </Center>
  </Panel>
</template>

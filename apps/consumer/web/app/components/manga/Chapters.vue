<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { volumeCards } from '~/features/manga/volumes'

  defineOptions({ name: 'MangaChapters' })

  const props = withDefaults(
    defineProps<{
      mangaId: number
      mangaTitle: string
      chapters: MangaPageData['chapters']
      volumes?: MangaPageData['volumes']
      progress: MangaPageData['progress']
      latestChapterAt?: string | null
      volumeNumber?: number | null
      showVolumes?: boolean
    }>(),
    {
      volumes: () => [],
      latestChapterAt: null,
      volumeNumber: null,
      showVolumes: true,
    },
  )

  function bySortKey(
    left: MangaPageData['chapters'][number],
    right: MangaPageData['chapters'][number],
  ) {
    return left.sort_key - right.sort_key
  }

  const episodes = computed(() =>
    props.chapters
      .filter(item => item.chapter_type === 'SERIALIZATION' || item.chapter_type === 'ONESHOT')
      .sort(bySortKey),
  )
  const extras = computed(() =>
    props.chapters.filter(item => item.chapter_type === 'EXTRA').sort(bySortKey),
  )
  const cards = computed(() =>
    props.showVolumes ? volumeCards(props.volumes, props.chapters) : [],
  )
  const hasEpisodes = computed(
    () => episodes.value.some(item => item.readable) || extras.value.some(item => item.readable),
  )
</script>

<template>
  <Stack v-if="hasEpisodes || cards.length" gap="none" class="gap-5">
    <MangaChaptersEpisodes
      v-if="hasEpisodes"
      :manga-id="mangaId"
      :episodes="episodes"
      :extras="extras"
      :progress="progress"
      :latest-chapter-at="latestChapterAt"
      :volume-number="volumeNumber"
    />
    <MangaChaptersVolumes
      v-if="cards.length"
      :manga-id="mangaId"
      :manga-title="mangaTitle"
      :cards="cards"
    />
  </Stack>
</template>

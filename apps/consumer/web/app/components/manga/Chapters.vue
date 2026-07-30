<script setup lang="ts">
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'

  defineOptions({ name: 'MangaChapters' })

  const props = withDefaults(
    defineProps<{
      mangaId: number
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
  const hasReadable = computed(
    () => episodes.value.some(item => item.readable) || extras.value.some(item => item.readable),
  )
</script>

<template>
  <div v-if="hasReadable || (showVolumes && volumes.length)" class="flex flex-col gap-5">
    <MangaChaptersEpisodes
      v-if="hasReadable"
      :manga-id="mangaId"
      :episodes="episodes"
      :extras="extras"
      :progress="progress"
      :latest-chapter-at="latestChapterAt"
      :volume-number="volumeNumber"
    />
    <MangaChaptersVolumes v-if="showVolumes && volumes.length" :volumes="volumes" />
  </div>
</template>

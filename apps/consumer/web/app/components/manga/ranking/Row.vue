<script setup lang="ts">
  import { chapterLabel, dayLabel } from '~/features/landing/labels'
  import { mangaWork } from '~/features/landing/works'
  import { mangaSerialStatusLabel } from '~/features/manga/labels'
  import type { BackendMangaRankingItem } from '~/features/ranking/ranking'

  defineOptions({ name: 'MangaRankingRow' })
  const props = defineProps<{ item: BackendMangaRankingItem; eager?: boolean }>()

  const work = computed(() => mangaWork(props.item))
  const note = computed(() => {
    const { chapter, serial_status } = props.item
    if (!chapter) return ''
    return serial_status && serial_status !== 'SERIALIZING'
      ? mangaSerialStatusLabel(serial_status)
      : dayLabel(chapter.at.slice(0, 10))
  })
</script>

<template>
  <RankingRow
    :to="work.to"
    :rank="item.rank"
    :previous="item.previous"
    :title="work.title"
    :original="work.original"
    :author="work.sub"
    :cover="item.volume_cover ?? work.cover"
    :tags="item.tags"
    :score="item.rating.count >= 3 ? item.rating.average : null"
    :detail="chapterLabel(item.chapter)"
    :note="note"
    :eager="eager"
  />
</template>

<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import { useMangaSearch } from '~/features/contribute/useMangaSearch'
  import { chapterNote, mangaVolumeNote, PROJECT_COPY } from '~/features/contribute/wanted'
  import { topVotedMedia } from '~/utils/media/image'
  import { getMangaEpisodeLabel, getMangaVolumeLabel } from '~/utils/media/manga'

  const props = defineProps<{
    chapters: ContributePageData['chapters']
    volumes: ContributePageData['manga_volumes']
    title?: string
  }>()

  type WantedChapter = ContributePageData['chapters'][number]
  type WantedVolume = ContributePageData['manga_volumes'][number]
  type Item =
    WantedChapter | WantedVolume | ReturnType<typeof useMangaSearch>['results']['value'][number]

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useMangaSearch()
  const searching = computed(() => !!search.value.trim())
  const listed = computed<(WantedChapter | WantedVolume)[]>(() =>
    [...props.volumes, ...props.chapters].sort((left, right) => right.readers - left.readers),
  )
  const items = computed<Item[]>(() => (searching.value ? results.value : listed.value))
  const starting = shallowRef<{
    series: MangaTarget
    chapter: { id: number; label: string } | null
    volume: { id: number; label: string } | null
  } | null>(null)
  const open = ref(false)

  const wanted = (item: Item): item is WantedChapter | WantedVolume => 'readers' in item
  const isChapter = (item: Item): item is WantedChapter => 'chapter_type' in item
  const isVolume = (item: Item): item is WantedVolume => wanted(item) && !isChapter(item)
  const key = (item: Item) =>
    isChapter(item)
      ? `chapter-${item.id}`
      : isVolume(item)
        ? `volume-${item.id}`
        : `manga-${item.id}`
  const series = (item: Item) =>
    wanted(item) ? item.series.name_cn || item.series.name : item.name_cn || item.name
  const subtitle = (item: Item) =>
    isChapter(item) ? getMangaEpisodeLabel(item) : isVolume(item) ? getMangaVolumeLabel(item) : null
  const note = (item: Item) =>
    isChapter(item) ? chapterNote(item) : isVolume(item) ? mangaVolumeNote(item) : null
  const cover = (item: Item) =>
    isVolume(item) && item.cover
      ? item.cover
      : topVotedMedia(wanted(item) ? item.series.covers : item.covers)
  const projects = (item: Item) => (wanted(item) ? item.projects : [])

  function pick(item: Item) {
    if (!requireLogin()) return
    starting.value = {
      series: { id: wanted(item) ? item.series.id : item.id, title: series(item) },
      chapter: isChapter(item) ? { id: item.id, label: getMangaEpisodeLabel(item) } : null,
      volume: isVolume(item) ? { id: item.id, label: getMangaVolumeLabel(item) } : null,
    }
    open.value = true
  }
</script>

<template>
  <ContributeWantedBoard
    v-model:search="search"
    :items="items"
    :item-key="key"
    :title="title"
    placeholder="搜索漫画"
    :empty-text="searching ? '没有找到漫画' : '没有内容'"
    :loading="loading"
  >
    <template #item="{ item }">
      <ContributeWantedItem
        :title="series(item)"
        :subtitle="subtitle(item)"
        :cover="cover(item)?.src"
        :disabled="projects(item).length > 0"
        @click="pick(item)"
      >
        <Text v-if="note(item)" as="span" size="xs" tone="muted" truncate>
          {{ note(item) }}
        </Text>
        <Text
          v-for="project in projects(item)"
          :key="project.mode"
          as="span"
          size="xs"
          tone="muted"
          truncate
        >
          <UserName :user="project.owner" :handle="false" class="inline-flex" />
          {{ PROJECT_COPY[project.mode] }}
        </Text>
      </ContributeWantedItem>
    </template>
  </ContributeWantedBoard>
  <ContributeMangaStartDialog
    v-if="starting"
    v-model:open="open"
    :series="starting.series"
    :chapter="starting.chapter"
    :volume="starting.volume"
    :scope="starting.volume ? 'VOLUME' : undefined"
  />
</template>

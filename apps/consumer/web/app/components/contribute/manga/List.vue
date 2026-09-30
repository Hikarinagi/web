<script setup lang="ts">
  import { Text } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import { useMangaSearch } from '~/features/contribute/useMangaSearch'
  import { chapterNote, PROJECT_COPY } from '~/features/contribute/wanted'
  import { topVotedMedia } from '~/utils/media/image'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  const props = defineProps<{ chapters: ContributePageData['chapters']; title?: string }>()

  type Wanted = ContributePageData['chapters'][number]
  type Item = Wanted | ReturnType<typeof useMangaSearch>['results']['value'][number]

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useMangaSearch()
  const searching = computed(() => !!search.value.trim())
  const items = computed<Item[]>(() => (searching.value ? results.value : props.chapters))
  const starting = shallowRef<{
    series: MangaTarget
    chapter: { id: number; label: string } | null
  } | null>(null)
  const open = ref(false)

  const wanted = (item: Item): item is Wanted => 'readers' in item
  const key = (item: Item) => (wanted(item) ? `chapter-${item.id}` : `manga-${item.id}`)
  const series = (item: Item) =>
    wanted(item) ? item.series.name_cn || item.series.name : item.name_cn || item.name
  const cover = (item: Item) => topVotedMedia(wanted(item) ? item.series.covers : item.covers)
  const projects = (item: Item) => (wanted(item) ? item.projects : [])

  function pick(item: Item) {
    if (!requireLogin()) return
    starting.value = {
      series: { id: wanted(item) ? item.series.id : item.id, title: series(item) },
      chapter: wanted(item) ? { id: item.id, label: getMangaEpisodeLabel(item) } : null,
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
        :subtitle="wanted(item) ? getMangaEpisodeLabel(item) : null"
        :cover="cover(item)?.src"
        :disabled="projects(item).length > 0"
        @click="pick(item)"
      >
        <Text v-if="wanted(item)" as="span" size="xs" tone="muted" truncate>
          {{ chapterNote(item) }}
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
  />
</template>

<script setup lang="ts">
  import { Button, DataList, Heading, SearchInput, Stack, Text } from '@hina-ui/vue'
  import type { ContributePageData } from '~~/server/api/pages/contribute.get'
  import type { MangaTarget } from '~/features/contribute/manga-target'
  import { useMangaSearch } from '~/features/contribute/useMangaSearch'
  import { chapterNote, PROJECT_COPY } from '~/features/contribute/wanted'
  import { topVotedMedia } from '~/utils/media/image'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  const props = defineProps<{ chapters: ContributePageData['chapters']; title?: string }>()

  type Mode = 'UPLOAD' | 'TRANSLATION'
  type Wanted = ContributePageData['chapters'][number]
  type Item = Wanted | ReturnType<typeof useMangaSearch>['results']['value'][number]

  const { requireLogin } = useAuthGate()
  const { search, results, loading } = useMangaSearch()
  const searching = computed(() => !!search.value.trim())
  const items = computed<Item[]>(() => (searching.value ? results.value : props.chapters))
  const starting = shallowRef<{
    series: MangaTarget
    chapter: { id: number; label: string } | null
    mode: Mode
  } | null>(null)
  const startOpen = ref(false)

  const wanted = (item: Item): item is Wanted => 'readers' in item
  const series = (item: Item) =>
    wanted(item) ? item.series.name_cn || item.series.name : item.name_cn || item.name
  const cover = (item: Item) => topVotedMedia(wanted(item) ? item.series.covers : item.covers)
  const episode = (item: Item) => (wanted(item) ? getMangaEpisodeLabel(item) : null)
  const projects = (item: Item) => (wanted(item) ? item.projects : [])

  function start(item: Item, mode: Mode) {
    if (!requireLogin()) return
    starting.value = {
      series: { id: wanted(item) ? item.series.id : item.id, title: series(item) },
      chapter: wanted(item) ? { id: item.id, label: getMangaEpisodeLabel(item) } : null,
      mode,
    }
    startOpen.value = true
  }
</script>

<template>
  <Stack gap="sm">
    <Heading v-if="title" :level="3">{{ title }}</Heading>
    <DataList
      :items="items"
      :item-key="item => (wanted(item) ? `chapter-${item.id}` : `manga-${item.id}`)"
      :item-title="series"
      :item-description="episode"
      :media-ratio="11 / 16"
      :loading="searching && loading"
      :empty-text="searching ? '没有找到漫画' : '没有内容'"
      :label="title ?? '正在征集的章节'"
      pagination
      :page-size="20"
    >
      <template #header>
        <SearchInput
          v-model="search"
          size="sm"
          placeholder="搜索漫画"
          aria-label="搜索漫画"
          class="w-full max-w-xs"
        />
      </template>
      <template #media="{ item }">
        <HikariImage
          :src="cover(item)?.src ?? null"
          :alt="series(item)"
          preset="small"
          class="size-full"
          image-class="object-cover"
        />
      </template>
      <template #meta="{ item }">
        <Stack v-if="wanted(item)" gap="none">
          <Text size="xs" tone="muted">{{ chapterNote(item) }}</Text>
          <Text v-for="project in projects(item)" :key="project.mode" size="xs" tone="muted">
            <UserName :user="project.owner" :handle="false" class="inline-flex" />
            {{ PROJECT_COPY[project.mode] }}
          </Text>
        </Stack>
      </template>
      <template #actions="{ item }">
        <template v-if="!projects(item).length">
          <Button variant="ghost" size="sm" @click="start(item, 'UPLOAD')">上传</Button>
          <Button variant="ghost" size="sm" @click="start(item, 'TRANSLATION')">翻译</Button>
        </template>
      </template>
    </DataList>

    <ContributeMangaStartDialog
      v-if="starting"
      v-model:open="startOpen"
      :series="starting.series"
      :chapter="starting.chapter"
      :mode="starting.mode"
    />
  </Stack>
</template>

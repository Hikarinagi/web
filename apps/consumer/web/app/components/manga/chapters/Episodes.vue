<script setup lang="ts">
  import { ArrowDownUp, LibraryBig } from '@lucide/vue'
  import type { MangaPageData } from '~~/server/api/pages/mangas/[id].get'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'

  defineOptions({ name: 'MangaChaptersEpisodes' })

  const SEGMENT_SIZE = 50
  const NEW_WINDOW_MS = 7 * 24 * 60 * 60 * 1000

  const props = withDefaults(
    defineProps<{
      mangaId: number
      episodes: MangaPageData['chapters']
      extras: MangaPageData['chapters']
      progress: MangaPageData['progress']
      latestChapterAt: string | null
      volumeNumber?: number | null
    }>(),
    { volumeNumber: null },
  )

  const volumeIds = computed(() => {
    if (props.volumeNumber == null) return new Set<number>()
    return new Set(
      props.episodes.filter(item => item.volume_number === props.volumeNumber).map(item => item.id),
    )
  })

  const volumeDescription = computed(() => {
    if (!volumeIds.value.size) return undefined
    const scoped = props.episodes.filter(item => volumeIds.value.has(item.id))
    const first = scoped[0]
    const last = scoped[scoped.length - 1]
    if (!first || !last) return undefined
    if (first.id === last.id) return `本卷收录 ${getMangaEpisodeLabel(first)}`
    return `本卷收录 ${getMangaEpisodeLabel(first)} ～ ${getMangaEpisodeLabel(last)}`
  })

  const segments = computed(() => {
    const out: { key: string; label: string; items: MangaPageData['chapters'] }[] = []
    for (let index = 0; index < props.episodes.length; index += SEGMENT_SIZE) {
      const items = props.episodes.slice(index, index + SEGMENT_SIZE)
      out.push({ key: `${index}`, label: `${index + 1}-${index + items.length}`, items })
    }
    return out
  })
  const pills = computed(() => {
    const list = segments.value.map(segment => ({ key: segment.key, label: segment.label }))
    if (props.extras.length) list.push({ key: 'extra', label: '番外' })
    return list.length > 1 ? list : []
  })

  const readIds = computed(() => new Set(props.progress?.read_chapter_ids ?? []))

  const active = ref(defaultKey())
  function defaultKey() {
    const firstVolumeChapterId = props.episodes.find(item => volumeIds.value.has(item.id))?.id
    if (firstVolumeChapterId != null) {
      const index = props.episodes.findIndex(item => item.id === firstVolumeChapterId)
      if (index >= 0) return `${Math.floor(index / SEGMENT_SIZE) * SEGMENT_SIZE}`
    }
    const continueId = props.progress?.chapter.id
    if (continueId != null) {
      const index = props.episodes.findIndex(item => item.id === continueId)
      if (index >= 0) return `${Math.floor(index / SEGMENT_SIZE) * SEGMENT_SIZE}`
      if (props.extras.some(item => item.id === continueId)) return 'extra'
    }
    return segments.value[0]?.key ?? 'extra'
  }

  const desc = ref(false)
  const current = computed(() => {
    const items =
      active.value === 'extra'
        ? props.extras
        : (segments.value.find(segment => segment.key === active.value)?.items ??
          segments.value[0]?.items ??
          [])
    return desc.value ? [...items].reverse() : items
  })

  const latest = computed(() => props.episodes.at(-1) ?? null)
  const newChapterId = computed(() => {
    if (!latest.value || !props.latestChapterAt) return null
    const time = Date.parse(props.latestChapterAt)
    if (!Number.isFinite(time)) return null
    return Date.now() - time < NEW_WINDOW_MS ? latest.value.id : null
  })

  const grid = useTemplateRef<HTMLElement>('grid')
  function jumpToLatest() {
    const last = segments.value.at(-1)
    if (last) active.value = last.key
    grid.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
</script>

<template>
  <CardPanel
    title="章节列表"
    :icon="LibraryBig"
    :count="episodes.length + extras.length"
    :description="volumeDescription"
  >
    <template #actions>
      <div class="flex items-center gap-1.5">
        <Button v-if="latest" variant="text" size="small" @click="jumpToLatest">
          更新至{{ getMangaEpisodeLabel(latest) }}
        </Button>
        <Button
          v-tooltip.bottom="desc ? '切回正序' : '倒序排列'"
          text
          severity="secondary"
          size="small"
          aria-label="切换排序"
          @click="desc = !desc"
        >
          <template #icon><ArrowDownUp class="size-4" /></template>
        </Button>
      </div>
    </template>

    <div class="flex flex-col gap-4">
      <MangaChaptersContinueStrip
        v-if="progress"
        :manga-id="mangaId"
        :progress="progress"
        :first="episodes[0] ?? null"
      />

      <div v-if="pills.length" class="flex flex-wrap gap-1.5">
        <Button
          v-for="pill in pills"
          :key="pill.key"
          unstyled
          class="rounded-full px-3 py-1 text-[13px] transition-colors"
          :class="
            active === pill.key
              ? 'bg-hikari-primary-50 font-medium text-hikari-primary-800 dark:bg-hikari-primary-950 dark:text-hikari-primary-300'
              : 'bg-emphasis text-muted-color hover:text-color'
          "
          @click="active = pill.key"
        >
          {{ pill.label }}
        </Button>
      </div>

      <div ref="grid" class="scroll-mt-24">
        <MangaChaptersGrid
          :manga-id="mangaId"
          :chapters="current"
          :new-chapter-id="newChapterId"
          :current-chapter-id="progress?.chapter.id ?? null"
          :read-ids="readIds"
          :volume-ids="volumeIds"
        />
      </div>
    </div>
  </CardPanel>
</template>

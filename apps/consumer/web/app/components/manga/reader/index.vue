<script setup lang="ts">
  import { useMediaQuery } from '@vueuse/core'
  import { AnimatePresence, motion } from 'motion-v'
  import { push } from 'notivue'
  import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
  import { useMangaRate } from '~/features/manga/useMangaRate'
  import { getMangaEpisodeLabel } from '~/utils/media/manga'
  import { useMangaReader } from './composables/useMangaReader'
  import { usePageLoader } from './composables/usePageLoader'
  import { useProgressSync } from './composables/useProgressSync'
  import { useReaderChrome } from './composables/useReaderChrome'
  import { useReaderInteractions } from './composables/useReaderInteractions'
  import { useReaderSettings } from './composables/useReaderSettings'
  import { useReaderEducation } from '~/components/reader/composables/useReaderEducation'
  import { useReaderExit } from '~/components/reader/composables/useReaderExit'
  import { MANGA_READER_EDUCATION_KEY, mangaEducationHints } from './lib/education'

  defineOptions({ name: 'MangaReader' })

  const props = defineProps<{
    data: MangaReadPageData
    refreshData: () => Promise<void>
  }>()

  const manga = computed(() => props.data.manifest.manga)
  const chapter = computed(() => props.data.manifest.chapter)
  const title = computed(() => manga.value.name_cn || manga.value.name)
  const chapterLabel = computed(() => {
    const label = getMangaEpisodeLabel(chapter.value)
    const name = chapter.value.chapter_number ? chapter.value.name_cn || chapter.value.name : null
    return name ? `${label} ${name}` : label
  })

  const { settings, toggleLayout, cycleFit } = useReaderSettings()
  const isMobile = useMediaQuery('(max-width: 639px)')
  const effectiveLayout = computed(() => (isMobile.value ? 'single' : settings.value.layout))
  const effectiveFit = computed(() => (isMobile.value ? 'screen' : settings.value.fit))

  const reader = useMangaReader({
    pages: () => props.data.manifest.pages,
    layout: () => effectiveLayout.value,
    initialPage: props.data.manifest.progress_page,
    hasNext: () => !!props.data.manifest.next_chapter && !props.data.manifest.next_chapter_locked,
    onEnterInterlude: () => {},
    onAdvancePastInterlude: openNextChapter,
  })

  const loader = usePageLoader({
    pages: () => props.data.manifest.pages,
    refreshUrls: () => props.refreshData(),
  })

  const settingsOpen = ref(false)
  const catalogOpen = ref(false)
  const settingsPopover = ref()

  const chrome = useReaderChrome({
    panelOpen: () => settingsOpen.value || catalogOpen.value,
  })

  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const education = useReaderEducation(MANGA_READER_EDUCATION_KEY)
  const educationHints = computed(() =>
    mangaEducationHints({
      coarsePointer: coarsePointer.value,
      zoomable: effectiveFit.value === 'screen',
    }),
  )

  function dismissEducation() {
    education.dismiss()
    chrome.show()
  }

  const auth = useAuthStore()
  const rate = useMangaRate(manga.value.id, props.data.my_rate)
  const showMarkCta = computed(() => auth.isAuthenticated && !rate.status.value)

  async function markGoing() {
    try {
      await rate.setStatus('GOING', false)
      push.success({ message: '已标记在看' })
    } catch {
      /* empty */
    }
  }

  useProgressSync({
    mangaId: manga.value.id,
    chapterId: chapter.value.id,
    page: () => reader.maxVisiblePage.value,
    authenticated: () => auth.isAuthenticated,
  })

  watch(
    () => auth.isAuthenticated,
    authenticated => {
      if (authenticated) void props.refreshData()
    },
  )

  const colorMode = useColorMode()
  const lightBackground = computed(() => {
    if (settings.value.background === 'white') return true
    return settings.value.background === 'system' && colorMode.value !== 'dark'
  })
  const backgroundClass = computed(() => (lightBackground.value ? 'bg-white' : 'bg-[#06080c]'))

  const pageLabel = computed(() => `${reader.maxVisiblePage.value} / ${reader.totalPages.value}`)
  const showFloatingPageNumber = computed(
    () =>
      settings.value.show_page_number &&
      !chrome.visible.value &&
      !reader.atInterlude.value &&
      reader.totalPages.value > 0,
  )

  const leavingLabel = ref<string | null>(null)

  function openNextChapter() {
    const next = props.data.manifest.next_chapter
    if (!next || props.data.manifest.next_chapter_locked || leavingLabel.value) return
    leavingLabel.value = '正在进入下一话'
    void navigateTo(`/mangas/${manga.value.id}/read/${next.id}`, { replace: true })
  }

  const { back: goBack, exit: backToDetail } = useReaderExit(() => `/mangas/${manga.value.id}`)

  function openChapter(target: { id: number }) {
    if (leavingLabel.value) return
    leavingLabel.value = '正在打开章节'
    catalogOpen.value = false
    void navigateTo(`/mangas/${manga.value.id}/read/${target.id}`, { replace: true })
  }

  const interactions = useReaderInteractions({
    educationVisible: education.visible,
    next: reader.next,
    previous: reader.previous,
    hideChrome: chrome.hide,
    toggleChrome: chrome.toggle,
  })

  watch(
    () => reader.currentSpread.value,
    spread => {
      if (!spread?.pages.length) return
      loader.ensureAround(spread.pages.map(page => page.page_number))
    },
  )

  onMounted(() => {
    const spread = reader.currentSpread.value
    if (spread?.pages.length) loader.ensureAround(spread.pages.map(page => page.page_number))
  })
</script>

<template>
  <div
    class="manga-reader-root fixed inset-0 overflow-hidden"
    :class="backgroundClass"
    @contextmenu="interactions.onContextMenu"
  >
    <MangaReaderStage
      :spreads="reader.spreads.value"
      :current="reader.currentIndex.value"
      :fit="effectiveFit"
      :can-go-next="reader.canGoNext.value"
      :can-go-previous="reader.canGoPrevious.value"
      :animate="settings.page_animation"
      :status-of="loader.statusOf"
      :image-of="loader.imageOf"
      @next="reader.next"
      @previous="reader.previous"
      @tap="interactions.onChromeIntent"
      @retry-page="page => loader.retry(page)"
      @pointer-move="chrome.onStagePointerMove"
    >
      <template #interlude>
        <MangaReaderInterlude
          :manga-id="manga.id"
          :manga-title="title"
          :chapter-label="chapterLabel"
          :next-chapter="data.manifest.next_chapter"
          :next-locked="data.manifest.next_chapter_locked"
          :show-mark-cta="showMarkCta"
          :marking="rate.pending.value"
          :light="lightBackground"
          @open-next="openNextChapter"
          @open-catalog="catalogOpen = true"
          @back-to-detail="backToDetail"
          @mark="markGoing"
        />
      </template>
    </MangaReaderStage>

    <MangaReaderChrome
      :visible="chrome.visible.value"
      :title="title"
      :chapter-label="chapterLabel"
      :total="reader.totalPages.value"
      :filled="reader.maxVisiblePage.value"
      :layout="effectiveLayout"
      :fit="effectiveFit"
      :can-go-next="reader.canGoNext.value"
      :can-go-previous="reader.canGoPrevious.value"
      :show-layout-controls="!isMobile"
      @back="goBack"
      @open-catalog="catalogOpen = true"
      @next="reader.next"
      @previous="reader.previous"
      @jump="page => reader.goToPage(page)"
      @toggle-layout="toggleLayout"
      @cycle-fit="cycleFit"
      @open-settings="event => settingsPopover?.toggle(event)"
    />

    <p
      v-if="showFloatingPageNumber"
      class="absolute right-4 bottom-3 z-10 text-xs tabular-nums"
      :class="lightBackground ? 'text-black/45' : 'text-white/45'"
    >
      {{ pageLabel }}
    </p>

    <MangaReaderSettingsPopover
      ref="settingsPopover"
      v-model:settings="settings"
      :show-layout-controls="!isMobile"
      @show="settingsOpen = true"
      @hide="settingsOpen = false"
      @replay-education="education.replay()"
    />

    <MangaReaderChapterDrawer
      v-model:visible="catalogOpen"
      :chapters="data.chapters"
      :current-chapter-id="chapter.id"
      @select="openChapter"
    />

    <div
      v-if="leavingLabel"
      class="absolute inset-0 z-30 flex items-center justify-center"
      :class="backgroundClass"
    >
      <div class="flex flex-col items-center gap-4">
        <Spinner :size="34" :label="null" />
        <p class="text-sm" :class="lightBackground ? 'text-black/50' : 'text-[#8b95a6]'">
          {{ leavingLabel }}
        </p>
      </div>
    </div>

    <AnimatePresence>
      <motion.div
        v-if="education.visible.value"
        key="manga-reader-education"
        class="absolute inset-0 z-50"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <ReaderEducationOverlay :hints="educationHints" @dismiss="dismissEducation" />
      </motion.div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
  .manga-reader-root {
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
    overscroll-behavior: none;
  }
</style>

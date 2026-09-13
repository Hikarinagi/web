<script setup lang="ts">
  import { AnimatePresence, motion } from 'motion-v'
  import type { TocEntry } from '@ritojs/core'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'
  import { useHikariReader } from './composables/useHikariReader'
  import {
    DEFAULT_ANNOTATION_COLOR,
    useReaderAnnotations,
    type ReaderAnnotation,
  } from './composables/useReaderAnnotations'
  import { useReaderBookmarks } from './composables/useReaderBookmarks'
  import { useReaderClock } from './composables/useReaderClock'
  import { useReaderContextItems } from './composables/useReaderContextItems'
  import { useReaderContextMenu } from './composables/useReaderContextMenu'
  import { useReaderControls } from './composables/useReaderControls'
  import { useReaderFootnotes } from './composables/useReaderFootnotes'
  import { useReaderImagePreview } from './composables/useReaderImagePreview'
  import { useReaderIntroReveal } from './composables/useReaderIntroReveal'
  import { useReaderLinkPrompts } from './composables/useReaderLinkPrompts'
  import { useReaderRenderReport } from './composables/useReaderRenderReport'
  import { useReaderSettingsPersist } from './composables/useReaderSettingsPersist'
  import { useReaderSystemTheme } from './composables/useReaderSystemTheme'
  import { useReaderTapNavigation } from './composables/useReaderTapNavigation'
  import { useReaderEducation } from '~/components/reader/composables/useReaderEducation'
  import { useReaderExit } from '~/components/reader/composables/useReaderExit'
  import {
    HIKARI_READER_DEFAULT_DEVICE_SETTINGS,
    HIKARI_READER_DEVICE_SETTINGS_KEY,
  } from './lib/device-settings'
  import { HIKARI_READER_EDUCATION_KEY, readerEducationHints } from './lib/education'
  import { deriveReaderTheme } from './lib/theme'

  defineOptions({
    name: 'HikariReader',
  })

  const props = defineProps<{
    data: LightNovelVolumeReaderPageData
  }>()

  const title = computed(() => getLightNovelVolumeTitle(props.data.volume))
  const subtitle = computed(() => getLightNovelTitle(props.data.light_novel))
  const settings = ref<LightNovelVolumeReaderPageData['settings']>({ ...props.data.settings })
  const device = useLocalStorage(
    HIKARI_READER_DEVICE_SETTINGS_KEY,
    { ...HIKARI_READER_DEFAULT_DEVICE_SETTINGS },
    { mergeDefaults: true },
  )
  const education = useReaderEducation(HIKARI_READER_EDUCATION_KEY)
  useReaderSystemTheme(settings)
  useReaderSettingsPersist({ settings })
  const reader = useHikariReader({
    volumeId: props.data.volume.id,
    settings,
    device,
    state: props.data.state,
  })
  const {
    canGoNext,
    canGoPrevious,
    currentPosition,
    currentSpread,
    error,
    goTo,
    goToPosition,
    goToSpread,
    isLoaded,
    jumpToSpread,
    isLoading,
    load,
    next,
    previous,
    progressPercentage,
    retry: retryReader,
    surface,
    toc,
    totalSpreads,
  } = reader

  const catalogOpen = ref(false)
  const settingsOpen = ref(false)
  const bookmarksOpen = ref(false)
  const bookmarkDialogOpen = ref(false)
  const annotationsOpen = ref(false)
  const annotationDialogOpen = ref(false)
  const annotationDialogMode = ref<'create' | 'edit'>('create')
  const annotationDialogInitialNote = ref<string | null>(null)
  const annotationDialogInitialColor = ref<string | null>(null)
  const annotationDialogPreview = ref<string | null>(null)
  const editingAnnotationId = ref<string | null>(null)
  const pendingAnnotationKind = ref<'highlight' | 'underline' | null>(null)
  const dialogMode = ref<'create' | 'edit'>('create')
  const dialogInitialNote = ref<string | null>(null)
  const editingBookmarkId = ref<number | null>(null)
  const anyPanelOpen = computed(
    () => catalogOpen.value || settingsOpen.value || bookmarksOpen.value || annotationsOpen.value,
  )
  const activeHref = computed(() => {
    const pageIndex = currentPosition.value?.projection.pageIndex
    if (pageIndex === undefined) return null
    return reader.reader.value?.findActiveTocEntry(pageIndex)?.href ?? null
  })
  const progressLabel = computed(() => `${progressPercentage.value.toFixed(1)}%`)
  const spreadLabel = computed(() => {
    if (!totalSpreads.value) return '加载中'
    return `${currentSpread.value + 1} / ${totalSpreads.value}`
  })

  const controls = useReaderControls({
    controller: reader.controller,
    loaded: isLoaded,
    panelOpen: () => anyPanelOpen.value,
    closePanels: () => {
      catalogOpen.value = false
      settingsOpen.value = false
      bookmarksOpen.value = false
      annotationsOpen.value = false
    },
  })
  const educationHints = computed(() =>
    readerEducationHints({
      coarsePointer: controls.isCoarsePointer.value,
      tapZones: device.value.tap_zones,
    }),
  )
  const surfaceTap = useReaderTapNavigation({
    device,
    isCoarsePointer: controls.isCoarsePointer,
    isLoaded,
    surface,
    currentSpread,
    jumpToSpread,
    toggleToolbar: controls.toggle,
    next,
    previous,
    blocked: education.visible,
  })

  const contextMenuEl = ref<HTMLElement | null>(null)
  const contextMenu = useReaderContextMenu(contextMenuEl)
  const clock = useReaderClock()
  const bookmarks = useReaderBookmarks({
    volumeId: props.data.volume.id,
    reader: reader.reader,
    currentPosition,
    goToPosition,
    initial: props.data.state.bookmarks,
  })
  const annotations = useReaderAnnotations({
    volumeId: props.data.volume.id,
    controller: reader.controller,
    reader: reader.reader,
    currentPosition,
    surface,
    goToSpread,
    suppressTap: surfaceTap.suppressTap,
    initial: props.data.state.annotations,
  })
  useReaderImagePreview({
    controller: reader.controller,
    suppressTap: surfaceTap.suppressTap,
  })
  const linkPrompts = useReaderLinkPrompts({
    controller: reader.controller,
    currentSpread,
    suppressTap: surfaceTap.suppressTap,
  })
  const footnotes = useReaderFootnotes({
    controller: reader.controller,
    currentSpread,
    suppressTap: surfaceTap.suppressTap,
  })
  const {
    open: reportOpen,
    snapshot: reportSnapshot,
    submitting: reportSubmitting,
    openReport,
    submit: submitRenderReport,
  } = useReaderRenderReport({ volumeId: props.data.volume.id, reader, settings })

  const theme = computed(() =>
    deriveReaderTheme(settings.value.background_color, settings.value.text_color),
  )
  const onlineReadingAvailable = computed(() => props.data.volume.online_reading_available)
  const themeStyle = computed(() => ({
    '--reader-bar-bg': theme.value.barBackground,
    '--reader-bar-border': theme.value.barBorder,
    '--reader-bar-shadow': theme.value.barShadow,
    '--reader-text': theme.value.textColor,
    '--reader-text-muted': theme.value.textMuted,
    '--reader-icon': theme.value.iconColor,
    '--reader-icon-hover-bg': theme.value.iconHoverBg,
  }))

  useReaderIntroReveal(isLoaded, controls.showIntro)

  onMounted(() => {
    if (onlineReadingAvailable.value) void load()
  })

  function retry() {
    controls.showTransient()
    if (onlineReadingAvailable.value) retryReader()
  }

  function openCatalog() {
    catalogOpen.value = true
  }

  function openSettings() {
    settingsOpen.value = true
  }

  function openBookmarks() {
    bookmarksOpen.value = true
  }

  function addBookmark() {
    if (bookmarks.hasCurrent.value) {
      void bookmarks.add()
      return
    }
    dialogMode.value = 'create'
    dialogInitialNote.value = null
    editingBookmarkId.value = null
    bookmarkDialogOpen.value = true
  }

  function editBookmark(bookmark: Parameters<typeof bookmarks.jumpTo>[0]) {
    dialogMode.value = 'edit'
    dialogInitialNote.value = bookmark.note ?? null
    editingBookmarkId.value = bookmark.id
    bookmarkDialogOpen.value = true
  }

  function submitBookmarkDialog(note: string | null) {
    if (dialogMode.value === 'edit' && editingBookmarkId.value !== null) {
      void bookmarks.update(editingBookmarkId.value, { note })
      editingBookmarkId.value = null
      return
    }
    void bookmarks.add(note ?? undefined)
  }

  function jumpToBookmark(bookmark: Parameters<typeof bookmarks.jumpTo>[0]) {
    bookmarks.jumpTo(bookmark)
    bookmarksOpen.value = false
  }

  function openAnnotations() {
    annotationsOpen.value = true
  }

  function openNoteFromSelection(kind: 'highlight' | 'underline') {
    const text = annotations.selection.value?.text ?? null
    annotations.dismissPopovers()
    annotationDialogMode.value = 'create'
    annotationDialogInitialNote.value = null
    annotationDialogInitialColor.value = DEFAULT_ANNOTATION_COLOR
    annotationDialogPreview.value = text
    editingAnnotationId.value = null
    pendingAnnotationKind.value = kind
    annotationDialogOpen.value = true
  }

  function openNoteFromAnnotation(record: ReaderAnnotation) {
    annotations.dismissPopovers()
    annotationDialogMode.value = 'edit'
    annotationDialogInitialNote.value = record.note ?? null
    annotationDialogInitialColor.value = record.color ?? DEFAULT_ANNOTATION_COLOR
    annotationDialogPreview.value = annotations.textOf(record) || null
    editingAnnotationId.value = record.id
    pendingAnnotationKind.value = null
    annotationDialogOpen.value = true
  }

  function submitAnnotationDialog(payload: { note: string | null; color?: string }) {
    if (annotationDialogMode.value === 'edit' && editingAnnotationId.value) {
      void annotations.update(editingAnnotationId.value, { note: payload.note ?? undefined })
      editingAnnotationId.value = null
      return
    }
    const kind = pendingAnnotationKind.value
    pendingAnnotationKind.value = null
    if (kind) {
      void annotations.add({
        kind,
        color: payload.color ?? DEFAULT_ANNOTATION_COLOR,
        note: payload.note ?? undefined,
      })
    }
  }

  function changeAnnotationColor(id: string, color: string) {
    void annotations.update(id, { color })
  }

  function jumpToAnnotation(record: ReaderAnnotation) {
    annotations.jumpTo(record)
    annotationsOpen.value = false
  }

  function selectToc(entry: TocEntry) {
    goTo(entry)
    catalogOpen.value = false
  }

  const { back: goBackHistory, exit: goBack } = useReaderExit(
    () => `/light-novel-volumes/${props.data.volume.id}`,
  )

  const contextItems = useReaderContextItems({
    isLoaded,
    isLoading,
    onlineReadingAvailable,
    canGoPrevious,
    canGoNext,
    toc,
    toolbarVisible: controls.visible,
    hasCurrentBookmark: bookmarks.hasCurrent,
    previous,
    next,
    openCatalog,
    openSettings,
    openBookmarks,
    openAnnotations,
    addBookmark,
    toggleToolbar: controls.toggle,
    openReport,
    retry,
    back: goBackHistory,
    exit: goBack,
  })

  function onContextMenu(event: MouseEvent) {
    if (education.visible.value) return
    contextMenu.show(event)
  }

  function onRootClick(event: MouseEvent) {
    contextMenu.handleOutsidePointer(event.target)
    // The tap detector already acted on this gesture; the trailing compatibility
    // click must not be read as "pointer went down outside the toolbar".
    if (surfaceTap.consumeGhostClick()) return
    controls.handleOutsidePointer(event.target)
  }

  function onRootPointerDown(event: PointerEvent) {
    // Dismissing a popover is what this tap was for — it must not also page.
    if (annotations.handleOutsidePointer(event.target)) surfaceTap.suppressTap()
    if (footnotes.handleOutsidePointer(event.target)) surfaceTap.suppressTap()
  }

  watch(annotationDialogOpen, visible => {
    if (visible) return
    pendingAnnotationKind.value = null
    editingAnnotationId.value = null
    annotationDialogInitialColor.value = null
  })
</script>

<template>
  <div
    class="hikari-reader-root relative h-dvh overflow-hidden"
    :style="themeStyle"
    @contextmenu="onContextMenu"
    @pointerdown.capture="onRootPointerDown"
    @click="onRootClick"
  >
    <main class="relative h-dvh w-full overflow-hidden">
      <div
        ref="surface"
        data-hikari-reader-surface
        class="relative z-1 flex h-full w-full items-center justify-center overflow-hidden"
        @pointerdown.capture="surfaceTap.onPointerDown"
        @pointerup="surfaceTap.onPointerUp"
        @pointercancel="surfaceTap.onPointerCancel"
        @touchstart="surfaceTap.onTouchStart"
        @touchend="surfaceTap.onTouchEnd"
        @touchcancel="surfaceTap.onTouchCancel"
      />
      <HikariReaderStatusLayer
        :loaded="isLoaded"
        :loading="isLoading"
        :error="error"
        :online-reading-available="data.volume.online_reading_available"
        @retry="retry"
        @report="openReport"
      />
    </main>

    <HikariReaderControllerFrame
      :visible="controls.visible.value"
      :title="title"
      :subtitle="subtitle"
      :progress-value="progressPercentage"
      :progress-label="progressLabel"
      :spread-label="spreadLabel"
      :loading="isLoading"
      :loaded="isLoaded"
      :can-go-previous="canGoPrevious"
      :can-go-next="canGoNext"
      :toc-available="toc.length > 0"
      :has-current-bookmark="bookmarks.hasCurrent.value"
      :show-progress="settings.show_progress"
      :show-time="settings.show_time"
      :show-settings-button="controls.isCoarsePointer.value"
      :time-label="clock.time.value"
      @back="goBackHistory"
      @previous="previous"
      @next="next"
      @retry="retry"
      @open-catalog="openCatalog"
      @open-settings="openSettings"
      @add-bookmark="addBookmark"
      @open-report="openReport"
      @hover-start="controls.pauseTimer"
      @hover-end="controls.resumeTimer"
    />

    <HikariReaderCatalogPanel
      v-model:visible="catalogOpen"
      :title="title"
      :subtitle="subtitle"
      :items="toc"
      :active-href="activeHref"
      @select="selectToc"
    />

    <HikariReaderSettingsPanel
      v-model:visible="settingsOpen"
      v-model:settings="settings"
      v-model:device="device"
      @replay-education="education.replay()"
    />

    <HikariReaderBookmarkPanel
      v-model:visible="bookmarksOpen"
      :items="bookmarks.list.value"
      :has-current="bookmarks.hasCurrent.value"
      @jump="jumpToBookmark"
      @edit="editBookmark"
      @remove="id => bookmarks.remove(id)"
      @add-current="addBookmark"
    />

    <HikariReaderBookmarkDialog
      v-model:visible="bookmarkDialogOpen"
      :mode="dialogMode"
      :initial-note="dialogInitialNote"
      @submit="submitBookmarkDialog"
    />

    <HikariReaderAnnotationPanel
      v-model:visible="annotationsOpen"
      :items="annotations.list.value"
      :chapter-title="annotations.chapterTitleOf"
      :text="annotations.textOf"
      @jump="jumpToAnnotation"
      @edit="openNoteFromAnnotation"
      @remove="id => annotations.remove(id)"
    />

    <HikariReaderAnnotationNoteDialog
      v-model:visible="annotationDialogOpen"
      :mode="annotationDialogMode"
      :initial-note="annotationDialogInitialNote"
      :initial-color="annotationDialogInitialColor"
      :preview="annotationDialogPreview"
      :show-color="annotationDialogMode === 'create'"
      @submit="submitAnnotationDialog"
    />

    <HikariReaderReportDialog
      v-model:visible="reportOpen"
      :snapshot="reportSnapshot"
      :submitting="reportSubmitting"
      @submit="submitRenderReport"
    />

    <AnimatePresence>
      <HikariReaderLinkReturnPrompt
        v-if="linkPrompts.returnPrompt.value"
        :key="linkPrompts.returnPrompt.value.id"
        :label="linkPrompts.returnPrompt.value.label"
        @back="linkPrompts.back"
      />
    </AnimatePresence>

    <AnimatePresence>
      <HikariReaderFootnotePanel
        v-if="footnotes.active.value"
        :key="footnotes.active.value.id"
        :footnote="footnotes.active.value"
        @dismiss="footnotes.dismiss"
      />
    </AnimatePresence>

    <AnimatePresence>
      <HikariReaderAnnotationSelectionPopover
        v-if="annotations.selection.value"
        key="reader-selection-popover"
        :anchor="annotations.selection.value.anchor"
        @highlight="openNoteFromSelection('highlight')"
        @underline="openNoteFromSelection('underline')"
      />
    </AnimatePresence>

    <AnimatePresence>
      <HikariReaderAnnotationActionPopover
        v-if="
          annotations.activeAction.value &&
          annotations.findRecord(annotations.activeAction.value.id)
        "
        key="reader-action-popover"
        :annotation="annotations.findRecord(annotations.activeAction.value.id)!"
        :anchor="annotations.activeAction.value.anchor"
        @change-color="color => changeAnnotationColor(annotations.activeAction.value!.id, color)"
        @edit-note="
          openNoteFromAnnotation(annotations.findRecord(annotations.activeAction.value!.id)!)
        "
        @remove="annotations.remove(annotations.activeAction.value!.id)"
      />
    </AnimatePresence>

    <AnimatePresence>
      <motion.div
        v-if="education.visible.value"
        key="hikari-reader-education"
        class="absolute inset-0 z-50"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <ReaderEducationOverlay :hints="educationHints" @dismiss="education.dismiss" />
      </motion.div>
    </AnimatePresence>

    <AnimatePresence>
      <div
        v-if="contextMenu.visible.value"
        key="reader-context-menu"
        data-reader-context-menu
        class="pointer-events-none fixed inset-0 z-30"
      >
        <div
          ref="contextMenuEl"
          class="pointer-events-auto absolute"
          :style="{
            top: `${contextMenu.anchor.value.y}px`,
            left: `${contextMenu.anchor.value.x}px`,
          }"
        >
          <HikariReaderContextMenu :items="contextItems" @dismiss="contextMenu.dismiss" />
        </div>
      </div>
    </AnimatePresence>
  </div>
</template>

<style scoped>
  .hikari-reader-root {
    touch-action: none;
    overscroll-behavior: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    -webkit-tap-highlight-color: transparent;
  }

  .hikari-reader-root :deep(input),
  .hikari-reader-root :deep(textarea),
  .hikari-reader-root :deep([contenteditable]) {
    user-select: text;
    -webkit-user-select: text;
  }

  .hikari-reader-root :deep([data-hikari-reader-surface]),
  .hikari-reader-root :deep([data-hikari-reader-surface] *) {
    outline: none;
  }
</style>

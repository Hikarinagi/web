<script setup lang="ts">
  import { Center, Flex, Spinner, Stack, Text } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { AnimatePresence, motion } from 'motion-v'
  import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
  import { useReaderEducation } from '~/components/reader/composables/useReaderEducation'
  import { useReaderExit } from '~/components/reader/composables/useReaderExit'
  import { useProgressSync } from './composables/useProgressSync'
  import { useReaderChrome } from './composables/useReaderChrome'
  import { useReaderEnd } from './composables/useReaderEnd'
  import { useReaderInteractions } from './composables/useReaderInteractions'
  import { useReaderItems } from './composables/useReaderItems'
  import { useReaderTools } from './composables/useReaderTools'
  import { useReaderView } from './composables/useReaderView'
  import { MANGA_READER_EDUCATION_KEY, mangaEducationHints } from './lib/education'

  defineOptions({ name: 'MangaReader' })

  const props = defineProps<{ data: MangaReadPageData; refreshData: () => Promise<void> }>()

  const items = useReaderItems(() => props.data)
  const view = useReaderView({
    data: () => props.data,
    unit: () => items.unit.value,
    openNext: () => items.openSibling('next'),
  })
  const { reader, loader, settings, mode, narrow, paged } = view
  const manga = computed(() => props.data.manifest.manga)
  const title = computed(() => manga.value.name_cn || manga.value.name)

  const tools = useReaderTools(() => manga.value.id)
  const { settingsOpen, settingsAnchor, openSettings } = tools
  const end = useReaderEnd(() => props.data, items)

  const chrome = useReaderChrome({
    panelOpen: () => settingsOpen.value || items.directoryOpen.value,
  })
  function next() {
    reader.next()
    chrome.hide()
  }
  function previous() {
    reader.previous()
    chrome.hide()
  }

  const education = useReaderEducation(MANGA_READER_EDUCATION_KEY)
  const coarsePointer = useMediaQuery('(pointer: coarse)')
  const hints = computed(() =>
    mangaEducationHints({
      coarsePointer: coarsePointer.value,
      zoomable: view.fit.value === 'screen',
      mode: mode.value,
      direction: view.direction.value,
      tapSides: settings.value.tap_sides,
    }),
  )
  function dismissEducation() {
    education.dismiss()
    chrome.show()
  }

  const interactions = useReaderInteractions({
    educationVisible: education.visible,
    paged: () => paged.value,
    tapSides: () => settings.value.tap_sides,
    direction: () => view.direction.value,
    next,
    previous,
    showChrome: chrome.show,
    hideChrome: chrome.hide,
    toggleChrome: chrome.toggle,
  })

  const auth = useAuthStore()
  useProgressSync({
    mangaId: manga.value.id,
    chapterId: items.chapter.value.id,
    page: () => view.visiblePage.value,
    authenticated: () => auth.isAuthenticated,
  })
  whenever(
    () => auth.isAuthenticated,
    () => void props.refreshData(),
  )

  const colorMode = useColorMode()
  const light = computed(
    () =>
      settings.value.background === 'white' ||
      (settings.value.background === 'system' && colorMode.value !== 'dark'),
  )
  const showFloatingPage = computed(
    () =>
      settings.value.show_page_number &&
      !chrome.visible.value &&
      !reader.atInterlude.value &&
      reader.totalPages.value > 0,
  )

  const scrollStage = useTemplateRef<{ goToPage: (page: number) => void }>('scrollStage')
  function jump(page: number) {
    if (paged.value) reader.goToPage(page)
    else scrollStage.value?.goToPage(page)
  }

  const { back } = useReaderExit(() => `/mangas/${manga.value.id}`)
</script>

<template>
  <Flex
    class="fixed inset-0 overflow-hidden overscroll-none select-none [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none]"
    :class="light ? 'bg-neutral-0 text-neutral-1000' : 'dark bg-neutral-950 text-neutral-0'"
    @contextmenu="interactions.onContextMenu"
  >
    <MangaReaderStage
      v-if="paged"
      :spreads="reader.spreads.value"
      :current="reader.currentIndex.value"
      :fit="view.fit.value"
      :can-go-next="reader.canGoNext.value"
      :can-go-previous="reader.canGoPrevious.value"
      :animate="settings.page_animation"
      :direction="view.direction.value"
      :status-of="loader.statusOf"
      :image-of="loader.imageOf"
      @next="next"
      @previous="previous"
      @tap="interactions.onTap"
      @retry-page="page => loader.retry(page)"
    >
      <template #interlude>
        <MangaReaderInterlude v-bind="end.props.value" v-on="end.events" />
      </template>
    </MangaReaderStage>
    <MangaReaderScrollStage
      v-else
      ref="scrollStage"
      :pages="data.manifest.pages"
      :start-page="data.manifest.progress_page ?? 1"
      :status-of="loader.statusOf"
      :image-of="loader.imageOf"
      @page="page => (view.scrollPage.value = page)"
      @end="ended => (view.scrollEnded.value = ended)"
      @tap="interactions.onTap"
      @retry-page="page => loader.retry(page)"
    >
      <template #interlude>
        <MangaReaderInterlude v-bind="end.props.value" v-on="end.events" />
      </template>
    </MangaReaderScrollStage>

    <MangaReaderChrome :visible="chrome.visible.value">
      <template #top>
        <MangaReaderBarTop
          :title="title"
          :heading="items.heading.value"
          :narrow="narrow"
          :dark="!light"
          :paged="paged"
          :double="view.double.value"
          :fullscreen="tools.isFullscreen.value"
          @back="back"
          @directory="items.directoryOpen.value = true"
          @toggle-double="view.toggleDouble"
          @adjust="view.shift.value = !view.shift.value"
          @settings="openSettings"
          @fullscreen="tools.toggleFullscreen"
          @copy-link="tools.copyLink"
        />
      </template>
      <template #bottom>
        <MangaReaderBarBottom
          :narrow="narrow"
          :noun="items.noun.value"
          :has-previous="!!data.manifest.prev_chapter"
          :has-next="!!data.manifest.next_chapter"
          :mode="mode"
          :pages="data.manifest.pages"
          :shown="view.shown.value"
          :direction="view.direction.value"
          :spread-of="view.spreadOf"
          :status-of="loader.statusOf"
          :image-of="loader.imageOf"
          @previous="items.openSibling('previous')"
          @next="items.openSibling('next')"
          @jump="jump"
          @peek="loader.peek"
          @directory="items.directoryOpen.value = true"
          @toggle-mode="mode = paged ? 'scroll' : 'paged'"
          @settings="openSettings"
        />
      </template>
    </MangaReaderChrome>

    <Text
      v-if="showFloatingPage"
      size="xs"
      tone="faint"
      class="absolute end-4 bottom-3 z-10 tabular-nums"
    >
      {{ view.visiblePage.value }} / {{ reader.totalPages.value }}
    </Text>

    <MangaReaderSettingsPanel
      v-model:open="settingsOpen"
      v-model:settings="settings"
      v-model:mode="mode"
      v-model:direction="view.direction.value"
      :narrow="narrow"
      :dark="!light"
      :anchor="settingsAnchor"
      @guide="education.replay()"
    />
    <MangaReaderDirectory
      v-model:open="items.directoryOpen.value"
      v-model:unit="items.directoryUnit.value"
      v-model:range="items.directoryRange.value"
      :narrow="narrow"
      :dark="!light"
      :units="items.units.value"
      :status="items.status.value"
      :current-id="items.chapter.value.id"
      :current-page="view.visiblePage.value"
      :read-ids="items.readIds.value"
      :signed-in="auth.isAuthenticated"
      @select="items.select"
    />

    <Center v-if="items.leaving.value" class="absolute inset-0 z-30 bg-canvas">
      <Stack align="center" gap="md">
        <Spinner size="lg" aria-hidden="true" />
        <Text size="sm" tone="muted">{{ items.leaving.value }}</Text>
      </Stack>
    </Center>

    <AnimatePresence>
      <motion.div
        v-if="education.visible.value"
        key="manga-reader-education"
        class="absolute inset-0 z-50"
        :initial="{ opacity: 0 }"
        :animate="{ opacity: 1 }"
        :exit="{ opacity: 0 }"
      >
        <ReaderEducationOverlay :hints="hints" @dismiss="dismissEducation" />
      </motion.div>
    </AnimatePresence>
  </Flex>
</template>

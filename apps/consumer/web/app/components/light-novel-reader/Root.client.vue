<script setup lang="ts">
  import { Flex, Stack } from '@hina-ui/vue'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { usePostComposerDialog } from '~/components/feed/composer/composables/usePostComposerDialog'
  import { provideReader } from '~/features/light-novel-reader/context'
  import type { TocRow } from '~/features/light-novel-reader/toc'
  import { useReaderBookmarks } from '~/features/light-novel-reader/useReaderBookmarks'
  import { useReaderEnd } from '~/features/light-novel-reader/useReaderEnd'
  import { useReaderEngine } from '~/features/light-novel-reader/useReaderEngine'
  import { useReaderEvents } from '~/features/light-novel-reader/useReaderEvents'
  import { useReaderFonts } from '~/features/light-novel-reader/useReaderFonts'
  import { useReaderHighlights } from '~/features/light-novel-reader/useReaderHighlights'
  import { useReaderInput } from '~/features/light-novel-reader/useReaderInput'
  import { useReaderJumps } from '~/features/light-novel-reader/useReaderJumps'
  import { useReaderLocation } from '~/features/light-novel-reader/useReaderLocation'
  import { useReaderResume } from '~/features/light-novel-reader/useReaderResume'
  import { useReaderSearch } from '~/features/light-novel-reader/useReaderSearch'
  import { useReaderSelection } from '~/features/light-novel-reader/useReaderSelection'
  import { useReaderSettings } from '~/features/light-novel-reader/useReaderSettings'
  import { useReaderShell } from '~/features/light-novel-reader/useReaderShell'
  import { useReaderSync } from '~/features/light-novel-reader/useReaderSync'
  import { useReaderTour } from '~/features/light-novel-reader/useReaderTour'
  import { getLightNovelTitle, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  defineOptions({ name: 'LightNovelReaderRoot' })

  const props = defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const route = useRoute()
  const router = useRouter()
  const composer = usePostComposerDialog()
  let fresh = false
  const settings = useReaderSettings(props.data.reader?.settings ?? null)
  const shell = useReaderShell()
  const { phone, medium, wide, leftDocked, drawer, sheet, chrome } = shell
  const host = ref<HTMLElement | null>(null)
  const measured = useElementSize(host)
  const size = ref({ width: 0, height: 0 })
  watch([measured.width, measured.height], ([width, height]) => {
    const next = { width: Math.round(width), height: Math.round(height) }
    if (next.width < 1 || next.height < 1) return
    if (next.width === size.value.width && next.height === size.value.height) return
    size.value = next
  })

  const highlights = useReaderHighlights({
    volumeId: () => props.data.volume.id,
    position: () => location.position.value,
    controller: () => engine.stack.value?.controller,
  })
  const engine = useReaderEngine({
    volumeId: () => props.data.volume.id,
    position: () => (fresh ? undefined : props.data.reader?.state.progress?.position),
    host,
    size,
    settings,
    highlights,
  })
  const location = useReaderLocation(engine)
  const bookmarks = useReaderBookmarks({ volumeId: () => props.data.volume.id, engine, location })
  const fonts = useReaderFonts(engine, settings)
  const sync = useReaderSync({
    volumeId: () => props.data.volume.id,
    position: location.position,
    chapter: () => ({
      index: location.spine.value,
      href: location.position.value?.sourceLocator?.href,
      title: location.title.value || location.current.value?.label,
    }),
  })

  const tour = useReaderTour({ shell, ready: () => engine.phase.value === 'ready' })
  const end = useReaderEnd({
    volumeId: () => props.data.volume.id,
    host,
    engine,
    location,
    shell,
    flush: sync.flush,
  })

  const input = useReaderInput({
    engine,
    host,
    tapTurn: () => settings.device.value.tapTurn,
    paused: () => Boolean(drawer.value || sheet.value || tour.open.value || composer.open.value),
    edge: forward => end.edge(forward),
    onMiddle: () => {
      if (phone.value) chrome.value = !chrome.value
    },
    keys: {
      t: () => (phone.value ? (sheet.value = 'toc') : shell.toggleLeft()),
      s: () => (phone.value ? (sheet.value = 'settings') : shell.togglePanel('settings')),
      'ctrl+d': () => void bookmarks.toggle(),
      'meta+d': () => void bookmarks.toggle(),
      Enter: () => search.step(true),
      'shift+Enter': () => search.step(false),
      Escape: () => search.close(),
    },
  })

  const jumps = useReaderJumps(engine, location)
  const search = useReaderSearch({ engine, location, jumps, shell })

  function goTo(row: TocRow) {
    jumps.remember()
    engine.stack.value?.controller.navigateToTocEntry(row.entry)
    shell.settle()
  }

  const resume = useReaderResume({ volumeId: () => props.data.volume.id, engine, location })
  const selection = useReaderSelection(engine, host)
  const events = useReaderEvents({ engine, host, shell, jumps, highlights })

  provideReader({
    title: computed(
      () =>
        `${getLightNovelTitle(props.data.light_novel)} ${getLightNovelVolumeTitle(props.data.volume)}`,
    ),
    host,
    settings,
    shell,
    engine,
    location,
    fonts,
    highlights,
    bookmarks,
    selection,
    jumps,
    search,
    events,
    resume,
    end,
    tour,
    goTo,
    turn: input.turn,
  })

  let opened: number | null = null
  watch(
    [() => props.data.volume.id, () => Boolean(props.data.reader), size],
    ([id, signed, current]) => {
      if (!signed || current.width === 0 || opened === id) return
      if (opened !== null) sync.flush()
      opened = id
      fresh = route.query.from === 'start'
      if (fresh) void router.replace({ query: { ...route.query, from: undefined } })
      highlights.reset(props.data.reader?.state.annotations ?? [])
      bookmarks.reset(props.data.reader?.state.bookmarks ?? [])
      void engine.open()
    },
    { immediate: true },
  )

  const { pixelRatio } = useDevicePixelRatio()
  watch(pixelRatio, () => {
    if (engine.phase.value === 'ready') void engine.open(location.position.value)
  })

  const wakeLock = useWakeLock()
  watch(
    () => phone.value && settings.device.value.keepAwake && engine.phase.value === 'ready',
    awake => void (awake ? wakeLock.request('screen') : wakeLock.release()),
    { immediate: true },
  )
</script>

<template>
  <Stack
    gap="none"
    class="relative h-dvh w-full overflow-hidden bg-canvas text-fg"
    :style="{ '--reader-dock': `${shell.dock.value}px` }"
  >
    <LightNovelReaderDesktopTopBar v-if="!phone" :data="data" />
    <Flex class="min-h-0 flex-1">
      <LightNovelReaderDesktopColumn
        v-if="medium && data.reader"
        side="left"
        label="导航"
        :open="leftDocked"
      >
        <LightNovelReaderNavigationPanel standalone @close="shell.toggleLeft()" />
      </LightNovelReaderDesktopColumn>
      <Stack gap="none" class="relative min-w-0 flex-1">
        <LightNovelReaderStage :data="data" />
        <LightNovelReaderDesktopStatusBar v-if="!phone && data.reader" />
      </Stack>
      <LightNovelReaderDesktopRightColumn v-if="wide && data.reader" />
    </Flex>
    <LightNovelReaderPhoneChrome v-if="phone" :data="data" />
    <LightNovelReaderDesktopDrawers v-else-if="data.reader" />
    <template v-if="data.reader">
      <LightNovelReaderSelectionToolbar />
      <LightNovelReaderHighlightInspector />
      <LightNovelReaderTour />
    </template>
  </Stack>
</template>

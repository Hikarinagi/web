<script setup lang="ts">
  import {
    Drawer,
    IconButton,
    ScrollArea,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
  } from '@hina-ui/vue'
  import { GalleryVerticalEnd } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { MANGA_EDITOR } from '~/features/workbench/manga/composables/editor-context'
  import { useMangaRegions } from '~/features/workbench/manga/composables/useMangaRegions'
  import { useMangaTranslations } from '~/features/workbench/manga/composables/useMangaTranslations'
  import { usePageUpload } from '~/features/workbench/manga/composables/usePageUpload'
  import { usePageNavigation } from '~/features/workbench/manga/composables/usePageNavigation'
  import { projectKind } from '~/features/workbench/manga/labels'
  import type { BackendMangaProject, MangaRegionChange } from '~/features/workbench/manga/manga'
  import { tally } from '~/features/workbench/manga/progress'
  import { typesetRegions } from '~/features/workbench/manga/render'
  import { projectEpisode, seriesTitle } from '~/features/workbench/manga/series'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  const props = defineProps<{ data: WorkbenchMangaProjectPageData }>()
  const emit = defineEmits<{ refresh: [] }>()

  const project = computed(() => props.data.project)
  const translation = computed(() => project.value.mode === 'TRANSLATION')
  const store = useMangaRegions(() => props.data.project.id, props.data.regions)
  const translations = useMangaTranslations(store.find)
  const upload = usePageUpload(() => props.data.project.id)
  const { regions: all, selectedId, stale, saving, dirty } = store
  provide(MANGA_EDITOR, { store, translations, upload })
  watch(
    () => props.data.regions,
    rows =>
      store.sync(
        props.data.pages.map(item => item.id),
        rows,
      ),
  )

  const pagesOpen = ref(false)
  const {
    page,
    regions,
    open: openPage,
    advance,
  } = usePageNavigation(() => props.data.pages, store, {
    preferUnrendered: translation.value,
    onOpen: () => {
      pagesOpen.value = false
    },
  })
  const counts = computed(
    () => new Map(props.data.pages.map(item => [item.id, tally(store.of(item.id))])),
  )
  const typeset = computed(() => typesetRegions(regions.value, project.value.mode))
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    project.value.viewer_capabilities.includes(capability)
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(project.value.status))
  const layer = ref<'original' | 'cleaned' | 'rendered' | 'typeset'>('original')
  const mode = ref<'translate' | 'proofread' | 'typeset'>(
    can('translate') ? 'translate' : can('typeset') && !can('proofread') ? 'typeset' : 'proofread',
  )
  watch(mode, value => {
    if (value === 'typeset') layer.value = 'typeset'
  })
  const banner = computed(
    () =>
      !!project.value.viewer_role &&
      (project.value.status === 'REVIEW' || props.data.review?.status === 'REJECTED'),
  )

  const series = computed(() => seriesTitle(project.value.series))
  const episode = computed(() => projectEpisode(project.value))
  const kind = computed(() => projectKind(project.value))
  useHead({ title: () => `${series.value} ${episode.value}` })

  const wide = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1440 })
  const manage = useTemplateRef<{ open: (action: string) => void }>('manage')
  const refresh = useDebounceFn(() => emit('refresh'), 800)
  const { online, editing, focus } = useProjectRoom<MangaRegionChange>(
    'manga',
    () => project.value.id,
    change => {
      store.applyChange(change)
      if (change.kind === 'pages' || change.kind === 'task') void refresh()
    },
  )
  watch(selectedId, id => focus(id))

  function jump(note: { region_id: string; region: { page_id: number } }) {
    openPage(note.region.page_id)
    selectedId.value = note.region_id
  }
</script>

<template>
  <WorkbenchEditorTopBar back="/create/projects" :title="series" :subtitle="episode" :kind="kind">
    <template #status>
      <WorkbenchMangaShellSteps :project="project" />
      <WorkbenchMangaShellStatus
        :project="project"
        :pages="data.pages"
        :regions="all"
        :online="online"
      />
    </template>
    <IconButton
      v-if="!wide && data.pages.length"
      label="页面"
      variant="ghost"
      tone="neutral"
      class="shrink-0"
      @click="pagesOpen = true"
    >
      <GalleryVerticalEnd />
    </IconButton>
    <WorkbenchMangaShellActions
      :project="project"
      :pages="data.pages"
      :tasks="data.tasks"
      @changed="emit('refresh')"
      @manage="action => manage?.open(action)"
    />
  </WorkbenchEditorTopBar>

  <ScrollArea v-if="!data.pages.length || !page" class="min-h-0 flex-1">
    <Stack gap="lg" align="center" class="p-8">
      <WorkbenchMangaShellUpload
        :project="project"
        class="w-full max-w-3xl"
        @uploaded="emit('refresh')"
      />
    </Stack>
  </ScrollArea>
  <Splitter
    v-else
    :key="String(wide)"
    :direction="wide ? 'horizontal' : 'vertical'"
    :auto-save-id="`workbench-manga-${project.mode}-${wide ? 'wide' : 'narrow'}`"
    class="min-h-0 flex-1"
  >
    <template v-if="wide">
      <SplitterPanel :default-size="13" :min-size="9" :max-size="22" collapsible>
        <WorkbenchMangaShellPages
          :project="project"
          :pages="data.pages"
          :tasks="data.tasks"
          :current="page.id"
          :counts="counts"
          class="border-r border-line"
          @select="openPage"
          @changed="emit('refresh')"
          @upload="manage?.open('upload')"
        />
      </SplitterPanel>
      <SplitterHandle label="调整页面列表的宽度" />
    </template>
    <SplitterPanel :default-size="translation ? (wide ? 59 : 60) : 100" :min-size="35">
      <Stack gap="none" class="h-full">
        <Stack gap="sm" :class="banner ? 'p-3' : undefined">
          <WorkbenchMangaShellReviewBanner
            :project="project"
            :review="data.review"
            :pages="data.pages"
            @jump="jump"
          />
        </Stack>
        <WorkbenchMangaCanvasFrame
          v-model:layer="layer"
          :project="project"
          :pages="data.pages"
          :page="page"
          :regions="regions"
          :tasks="data.tasks"
          :selected-id="selectedId"
          :editable="translation && editable && can('label')"
          :typeset="typeset"
          :saving="saving"
          :dirty="dirty"
          :stale="stale.has(page.id)"
          class="min-h-0 flex-1"
          @select="id => (selectedId = id)"
          @create="shape => store.create(page!.id, shape)"
          @change="(id, shape) => store.update(id, shape)"
          @page="openPage"
          @reload="store.save().then(() => store.reload(page!.id))"
          @changed="emit('refresh')"
        />
      </Stack>
    </SplitterPanel>
    <template v-if="translation">
      <SplitterHandle label="调整文本框面板的宽度" />
      <SplitterPanel :default-size="wide ? 28 : 40" :min-size="20" :max-size="65" collapsible>
        <WorkbenchMangaSidePanel
          v-model:mode="mode"
          :project="project"
          :regions="regions"
          :editing="editing"
          :class="wide ? 'border-l border-line' : 'border-t border-line'"
          @advance="advance"
        />
      </SplitterPanel>
    </template>
  </Splitter>

  <Drawer v-if="!wide && page" v-model:open="pagesOpen" title="页面" side="start" size="sm">
    <template #content>
      <WorkbenchMangaShellPages
        :project="project"
        :pages="data.pages"
        :tasks="data.tasks"
        :current="page.id"
        :counts="counts"
        @select="openPage"
        @changed="emit('refresh')"
        @upload="manage?.open('upload')"
      />
    </template>
    <template #footer>
      <WorkbenchMangaShellStatus
        :project="project"
        :pages="data.pages"
        :regions="all"
        :online="online"
      />
    </template>
  </Drawer>
  <WorkbenchMangaManage
    ref="manage"
    :project="project"
    @refresh="emit('refresh')"
    @regions="store.refreshAll()"
  />
</template>

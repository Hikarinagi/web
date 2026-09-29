<script setup lang="ts">
  import {
    Drawer,
    IconButton,
    LoadingOverlay,
    ScrollArea,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
  } from '@hina-ui/vue'
  import { ListTree } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { LANGUAGE_LABELS } from '~/features/galgame/labels'
  import { PROJECT_MODE_LABEL } from '~/features/workbench/labels'
  import type { NovelImportDraft, NovelSegmentChange } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  type Note = NonNullable<WorkbenchProjectPageData['review']>['notes'][number]

  const props = defineProps<{ data: WorkbenchProjectPageData; pending: boolean }>()
  const emit = defineEmits<{ refresh: [] }>()

  const route = useRoute()
  const wide = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1440 })
  const chaptersOpen = ref(false)
  watch(
    () => props.data.chapter?.id,
    () => {
      chaptersOpen.value = false
    },
  )
  const project = computed(() => props.data.project)
  const translation = computed(() => project.value.mode === 'TRANSLATION')
  const chapters = ref(props.data.chapters)
  watch(
    () => props.data.chapters,
    value => {
      chapters.value = value
    },
  )
  const chapter = computed(
    () => chapters.value.find(item => item.id === props.data.chapter?.id) ?? null,
  )
  const focus = computed(() =>
    typeof route.query.segment === 'string' ? route.query.segment : null,
  )

  const series = computed(
    () => project.value.volume.series.name_cn || project.value.volume.series.name,
  )
  const volumeLabel = computed(() => {
    const volume = project.value.volume
    return (
      volume.volume_label ||
      (volume.volume_number != null ? `第 ${volume.volume_number} 卷` : '') ||
      volume.name_cn ||
      volume.name
    )
  })
  const language = (code: string | null) =>
    code ? (LANGUAGE_LABELS[code as keyof typeof LANGUAGE_LABELS] ?? code) : ''
  const kind = computed(() =>
    translation.value
      ? `${PROJECT_MODE_LABEL.TRANSLATION} · ${language(project.value.source_lang)} → ${language(project.value.target_lang)}`
      : `${PROJECT_MODE_LABEL.ENTRY} · ${language(project.value.source_lang)}`,
  )
  useHead({ title: () => `${series.value} ${volumeLabel.value ?? ''}` })

  const editor = useTemplateRef<{
    applyChange: (change: NovelSegmentChange) => void
    focusSegment?: (id: string) => void
  }>('editor')
  const reloadChapters = useDebounceFn(async () => {
    chapters.value = await hikariRequest('/api/v3/novel-projects/{project_id}/chapters', {
      path: { project_id: project.value.id },
      toast: false,
    }).catch(() => chapters.value)
  }, 800)
  const {
    online,
    editing,
    focus: position,
  } = useProjectRoom<NovelSegmentChange>(
    'novel',
    () => project.value.id,
    change => {
      editor.value?.applyChange(change)
      if (change.kind === 'chapters') emit('refresh')
      else if (change.kind !== 'lock' && change.kind !== 'unlock') void reloadChapters()
    },
  )

  const manage = useTemplateRef<{ open: (action: string) => void }>('manage')
  const draft = ref<NovelImportDraft | null>(null)

  function jump(note: Note) {
    if (note.segment.chapter_id === chapter.value?.id) {
      editor.value?.focusSegment?.(note.segment_id)
      return
    }
    void navigateTo({ query: { chapter: note.segment.chapter_id, segment: note.segment_id } })
  }

  function imported() {
    draft.value = null
    emit('refresh')
  }
</script>

<template>
  <WorkbenchEditorTopBar
    back="/create/projects"
    :title="series"
    :subtitle="volumeLabel"
    :kind="kind"
  >
    <template #status>
      <WorkbenchNovelStatus :project="project" :chapters="chapters" :online="online" />
    </template>
    <IconButton
      v-if="!wide && chapters.length && !draft"
      label="章节"
      variant="ghost"
      tone="neutral"
      class="shrink-0"
      @click="chaptersOpen = true"
    >
      <ListTree />
    </IconButton>
    <WorkbenchNovelActions
      :project="project"
      :chapters="chapters"
      @changed="emit('refresh')"
      @glossary="manage?.open('glossary')"
      @ai="manage?.open('ai')"
      @manage="action => manage?.open(action)"
    />
  </WorkbenchEditorTopBar>

  <WorkbenchNovelImportPreview
    v-if="draft"
    :key="`${draft.name}:${draft.file?.lastModified ?? ''}:${draft.preview.blocks.length}`"
    :project="project"
    :draft="draft"
    :existing="chapters.length"
    class="flex-1"
    @cancel="draft = null"
    @imported="imported"
  />
  <ScrollArea v-else-if="!chapters.length" class="min-h-0 flex-1">
    <Stack gap="lg" align="center" class="p-8">
      <WorkbenchNovelReviewBanner
        :project="project"
        :review="data.review"
        :chapters="chapters"
        @jump="jump"
      />
      <WorkbenchNovelImportStart
        :project="project"
        :has-epub="data.has_epub"
        class="w-full max-w-3xl"
        @preview="draft = $event"
        @created="emit('refresh')"
      />
    </Stack>
  </ScrollArea>
  <Splitter
    v-else
    :key="String(wide)"
    :auto-save-id="wide ? 'workbench-novel' : 'workbench-novel-narrow'"
    class="min-h-0 flex-1"
  >
    <template v-if="wide">
      <SplitterPanel :default-size="18" :min-size="12" :max-size="30" collapsible>
        <WorkbenchNovelChapters
          :project="project"
          :chapters="chapters"
          :current="chapter?.id ?? null"
          class="border-r border-line"
          @changed="emit('refresh')"
        />
      </SplitterPanel>
      <SplitterHandle label="调整章节列表宽度" />
    </template>
    <SplitterPanel :default-size="wide ? 82 : 100">
      <Stack gap="none" class="relative h-full">
        <WorkbenchNovelReviewBanner
          :project="project"
          :review="data.review"
          :chapters="chapters"
          @jump="jump"
        />
        <LoadingOverlay :visible="pending" />
        <template v-if="chapter">
          <WorkbenchNovelTranslateWorkspace
            v-if="translation"
            ref="editor"
            :key="chapter.id"
            :project="project"
            :chapter="chapter"
            :segments="data.segments"
            :terms="data.terms"
            :focus="focus"
            :editing="editing"
            class="min-h-0 flex-1"
            @position="position"
          />
          <WorkbenchNovelEntry
            v-else
            ref="editor"
            :key="`${chapter.id}:${project.status}`"
            :project="project"
            :chapter="chapter"
            :segments="data.segments"
            class="min-h-0 flex-1"
          />
        </template>
      </Stack>
    </SplitterPanel>
  </Splitter>

  <Drawer v-if="!wide" v-model:open="chaptersOpen" title="章节" side="start" size="sm">
    <template #content>
      <WorkbenchNovelChapters
        :project="project"
        :chapters="chapters"
        :current="chapter?.id ?? null"
        @changed="emit('refresh')"
      />
    </template>
  </Drawer>
  <WorkbenchNovelManage
    ref="manage"
    :data="data"
    :chapters="chapters"
    :chapter="chapter"
    @refresh="emit('refresh')"
    @progress="reloadChapters"
    @preview="draft = $event"
  />
</template>

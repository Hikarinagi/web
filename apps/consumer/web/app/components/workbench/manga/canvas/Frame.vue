<script setup lang="ts">
  import {
    Button,
    IconButton,
    Inline,
    Stack,
    Text,
    Toolbar,
    ToolbarButton,
    ToolbarSeparator,
    ToolbarToggleGroup,
    ToolbarToggleItem,
  } from '@hina-ui/vue'
  import {
    ChevronLeft,
    ChevronRight,
    Crosshair,
    Minus,
    MousePointer2,
    Plus,
    RefreshCw,
    Scan,
    SquareDashed,
  } from '@lucide/vue'
  import type { Point } from '~/features/workbench/manga/geometry'
  import type {
    BackendMangaPage,
    BackendMangaProject,
    BackendMangaRegion,
    BackendMangaTask,
  } from '~/features/workbench/manga/manga'
  import type { TypesetRegion } from '~/features/workbench/manga/render'

  type Layer = 'original' | 'cleaned' | 'rendered' | 'typeset'
  type Tool = 'select' | 'box' | 'point'

  const props = defineProps<{
    project: BackendMangaProject
    pages: BackendMangaPage[]
    page: BackendMangaPage
    regions: BackendMangaRegion[]
    tasks: BackendMangaTask[]
    selectedId: string | null
    editable: boolean
    typeset: TypesetRegion[]
    saving: boolean
    dirty: boolean
    stale: boolean
  }>()
  const layer = defineModel<Layer>('layer', { required: true })
  const emit = defineEmits<{
    select: [id: string | null]
    create: [shape: { vertices: Point[]; x: number; y: number }]
    change: [id: string, shape: { vertices: Point[]; x: number; y: number }]
    page: [id: number]
    reload: []
    changed: []
  }>()

  const ZOOMS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 3]
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const tool = ref<Tool>('select')
  const scale = ref<number | null>(null)
  const stage = useTemplateRef<{ viewport: HTMLDivElement | null }>('stage')
  const { width, height } = useElementSize(() => stage.value?.viewport)
  const fit = computed(() => {
    if (!width.value || !height.value) return 1
    return Math.min(1, (height.value * props.page.width) / (width.value * props.page.height))
  })
  const zoom = computed(() => scale.value ?? fit.value)
  const index = computed(() => props.pages.findIndex(item => item.id === props.page.id))
  const previous = computed(() => props.pages[index.value - 1] ?? null)
  const following = computed(() => props.pages[index.value + 1] ?? null)
  const layers = computed(() => [
    { value: 'original', label: '原图' },
    { value: 'cleaned', label: '清理图', disabled: !props.page.cleaned_url },
    ...(translation.value ? [{ value: 'typeset', label: '嵌字预览' }] : []),
    { value: 'rendered', label: '成品', disabled: !props.page.rendered_url },
  ])
  const status = computed(() =>
    props.saving ? '保存中…' : props.dirty ? '有未保存的修改' : '已保存',
  )

  function step(direction: -1 | 1) {
    const current = zoom.value
    const next =
      direction > 0
        ? ZOOMS.find(value => value > current + 0.001)
        : [...ZOOMS].reverse().find(value => value < current - 0.001)
    scale.value = next ?? current
  }

  watch(
    () => props.page.id,
    () => {
      if (
        (layer.value === 'cleaned' && !props.page.cleaned_url) ||
        (layer.value === 'rendered' && !props.page.rendered_url)
      ) {
        layer.value = 'original'
      }
      if (!import.meta.client) return
      for (const neighbor of [previous.value, following.value]) {
        if (!neighbor) continue
        const image = new Image()
        image.crossOrigin = 'anonymous'
        image.src = neighbor.original_url
      }
    },
    { immediate: true },
  )
</script>

<template>
  <Stack gap="none" class="h-full">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line bg-surface px-4"
    >
      <Text size="sm" weight="semibold" class="shrink-0 tabular-nums">
        第 {{ index + 1 }} / {{ pages.length }} 页
      </Text>
      <Inline gap="sm" align="center" justify="end" :wrap="false" class="min-w-0 flex-1">
        <Button v-if="stale" size="sm" variant="soft" @click="emit('reload')">
          <template #icon><RefreshCw /></template>
          其他成员更改了此页面，加载最新版本
        </Button>
        <Text v-else-if="editable" size="xs" tone="muted" class="shrink-0">{{ status }}</Text>
        <WorkbenchMangaCanvasPageActions
          :project="project"
          :page="page"
          :tasks="tasks"
          :typeset="typeset"
          @changed="emit('changed')"
        />
      </Inline>
    </Inline>
    <Stack gap="none" class="relative min-h-0 flex-1">
      <WorkbenchMangaCanvasStage
        ref="stage"
        :page="page"
        :regions="regions"
        :selected-id="selectedId"
        :layer="layer"
        :tool="tool"
        :zoom="zoom"
        :editable="editable"
        :typeset="typeset"
        class="h-full"
        @select="emit('select', $event)"
        @create="emit('create', $event)"
        @change="(id, shape) => emit('change', id, shape)"
      />
      <Toolbar label="画布工具" size="sm" class="absolute top-3 left-3 shadow-sm">
        <ToolbarToggleGroup
          :model-value="layer"
          label="图层"
          @update:model-value="value => value && (layer = value as Layer)"
        >
          <ToolbarToggleItem
            v-for="option in layers"
            :key="option.value"
            :value="option.value"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </ToolbarToggleItem>
        </ToolbarToggleGroup>
        <template v-if="editable">
          <ToolbarSeparator />
          <ToolbarToggleGroup
            :model-value="tool"
            label="工具"
            @update:model-value="value => value && (tool = value as Tool)"
          >
            <ToolbarToggleItem value="select" label="选择"><MousePointer2 /></ToolbarToggleItem>
            <ToolbarToggleItem value="box" label="画框"><SquareDashed /></ToolbarToggleItem>
            <ToolbarToggleItem value="point" label="标点"><Crosshair /></ToolbarToggleItem>
          </ToolbarToggleGroup>
        </template>
        <ToolbarSeparator />
        <ToolbarButton label="缩小" @click="step(-1)"><Minus /></ToolbarButton>
        <Text size="sm" class="min-w-12 text-center tabular-nums">
          {{ Math.round(zoom * 100) }}%
        </Text>
        <ToolbarButton label="放大" @click="step(1)"><Plus /></ToolbarButton>
        <ToolbarButton label="适合页面" @click="scale = null"><Scan /></ToolbarButton>
      </Toolbar>
      <Inline
        gap="xs"
        align="center"
        :wrap="false"
        class="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-line bg-surface px-1 shadow-sm"
      >
        <IconButton
          label="上一页"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="!previous"
          @click="previous && emit('page', previous.id)"
        >
          <ChevronLeft />
        </IconButton>
        <Text size="sm" class="tabular-nums">{{ index + 1 }} / {{ pages.length }}</Text>
        <IconButton
          label="下一页"
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="!following"
          @click="following && emit('page', following.id)"
        >
          <ChevronRight />
        </IconButton>
      </Inline>
    </Stack>
  </Stack>
</template>

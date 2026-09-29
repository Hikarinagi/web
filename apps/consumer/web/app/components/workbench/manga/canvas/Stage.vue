<script setup lang="ts">
  import { toast } from '@hina-ui/vue'
  import { useStagePointer } from '~/features/workbench/manga/composables/useStagePointer'
  import type { Point } from '~/features/workbench/manga/geometry'
  import type { BackendMangaPage, BackendMangaRegion } from '~/features/workbench/manga/manga'
  import { loadImage, renderTypeset, type TypesetRegion } from '~/features/workbench/manga/render'
  import { cn } from '~/utils/cn'

  const props = defineProps<{
    page: BackendMangaPage
    regions: BackendMangaRegion[]
    selectedId: string | null
    layer: 'original' | 'cleaned' | 'rendered' | 'typeset'
    tool: 'select' | 'box' | 'point'
    zoom: number
    editable: boolean
    typeset: TypesetRegion[]
  }>()
  const emit = defineEmits<{
    select: [id: string | null]
    create: [shape: { vertices: Point[]; x: number; y: number }]
    change: [id: string, shape: { vertices: Point[]; x: number; y: number }]
  }>()

  const auth = useAuthStore()
  const viewport = useTemplateRef<HTMLDivElement>('viewport')
  const surface = useTemplateRef<SVGSVGElement>('surface')
  const canvas = useTemplateRef<HTMLCanvasElement>('canvas')

  watch(
    () => props.selectedId,
    async id => {
      if (!id) return
      await nextTick()
      surface.value
        ?.querySelector(`[data-region-id="${id}"]`)
        ?.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' })
    },
  )

  defineExpose({ viewport })

  const { preview, draft, onPointerDown, onPointerMove, onPointerUp } = useStagePointer({
    surface,
    tool: () => props.tool,
    editable: () => props.editable,
    shapeOf: id => {
      const region = props.regions.find(item => item.id === id)
      return region && !lockedByOther(region)
        ? { vertices: region.vertices as Point[], x: region.x, y: region.y }
        : null
    },
    onSelect: id => emit('select', id),
    onCreate: shape => emit('create', shape),
    onChange: (id, shape) => emit('change', id, shape),
  })

  const imageUrl = computed(() => {
    if (props.layer === 'rendered') return props.page.rendered_url ?? props.page.original_url
    if (props.layer === 'cleaned') return props.page.cleaned_url ?? props.page.original_url
    return props.page.original_url
  })
  const shapes = computed(() =>
    props.regions.map(region =>
      preview.value?.id === region.id
        ? { ...region, ...preview.value }
        : { ...region, vertices: region.vertices as Point[] },
    ),
  )
  const lockedByOther = (region: BackendMangaRegion) =>
    !!region.locked_by &&
    region.locked_by !== auth.user?.id &&
    new Date(region.lock_expires_at ?? 0).getTime() > Date.now()
  const draftPoints = computed(() =>
    draft.value?.vertices
      .map(([px, py]) => `${px * props.page.width},${py * props.page.height}`)
      .join(' '),
  )

  let renders = 0
  watchDebounced(
    [() => props.layer, () => props.typeset, () => props.page.id],
    async () => {
      if (props.layer !== 'typeset' || !canvas.value) return
      const ticket = ++renders
      try {
        const image = await loadImage(props.page.cleaned_url ?? props.page.original_url)
        if (ticket !== renders || !canvas.value) return
        await renderTypeset(canvas.value, image, props.typeset)
      } catch {
        if (ticket === renders) toast.danger('生成嵌字预览失败。请刷新页面并重试。')
      }
    },
    { debounce: 300, deep: true, immediate: true },
  )
</script>

<template>
  <div ref="viewport" class="overflow-auto bg-inset px-4 py-16">
    <div
      class="relative mx-auto"
      :style="{ width: `${zoom * 100}%`, aspectRatio: `${page.width} / ${page.height}` }"
    >
      <canvas v-if="layer === 'typeset'" ref="canvas" class="block size-full" />
      <img
        v-else
        :src="imageUrl"
        :width="page.width"
        :height="page.height"
        crossorigin="anonymous"
        alt=""
        draggable="false"
        class="block size-full select-none"
      />
      <svg
        ref="surface"
        :viewBox="`0 0 ${page.width} ${page.height}`"
        preserveAspectRatio="none"
        :class="
          cn(
            'absolute inset-0 size-full touch-none',
            editable && tool !== 'select' && 'cursor-crosshair',
          )
        "
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <WorkbenchMangaCanvasShape
          v-for="(region, index) in shapes"
          :id="region.id"
          :key="region.id"
          :vertices="region.vertices"
          :x="region.x"
          :y="region.y"
          :index="index"
          :width="page.width"
          :height="page.height"
          :selected="region.id === selectedId"
          :locked="lockedByOther(region)"
          :handle="editable && region.id === selectedId"
        />
        <polygon
          v-if="draftPoints"
          :points="draftPoints"
          vector-effect="non-scaling-stroke"
          stroke-width="2"
          stroke-dasharray="6 4"
          class="pointer-events-none fill-accent/10 stroke-accent"
        />
      </svg>
    </div>
  </div>
</template>

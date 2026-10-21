<script setup lang="ts">
  import type { MangaNoteRect } from '~/features/workbench/manga/manga'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { useViewport } from '~/features/workbench/manga/review/useViewport'
  import { cn } from '~/utils/cn'

  const props = defineProps<{
    src: string | null
    width: number
    height: number
    alt: string
    pageId?: number
  }>()

  const { state, drawing, pending, focus, notes } = useMangaReview()
  const container = useTemplateRef<HTMLDivElement>('container')
  const frame = useTemplateRef<HTMLDivElement>('frame')
  const drawable = computed(() => props.pageId !== undefined && drawing.value)
  const { box, pannable, draft, onPointerDown, onPointerMove, onPointerUp } = useViewport({
    container,
    frame,
    size: () => ({ width: props.width, height: props.height }),
    zoom: () => state.zoom.value,
    center: state.center,
    drawing: () => drawable.value,
    onDraw: (rect, anchor) => {
      drawing.value = false
      if (props.pageId !== undefined) pending.value = { page_id: props.pageId, rect, anchor }
    },
  })

  const same = (a: MangaNoteRect, b: MangaNoteRect | null) =>
    !!b && a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h
  const marks = computed(() => {
    if (props.pageId === undefined) return []
    const highlighted = focus.value?.page_id === props.pageId ? focus.value.rect : null
    return [
      ...notes.value
        .filter(note => note.page_id === props.pageId && note.rect)
        .map(note => ({
          key: `note-${note.id}`,
          rect: note.rect!,
          strong: same(note.rect!, highlighted),
        })),
      ...(pending.value?.page_id === props.pageId
        ? [{ key: 'pending', rect: pending.value.rect, strong: true }]
        : []),
      ...(draft.value ? [{ key: 'draft', rect: draft.value, strong: true }] : []),
    ]
  })
  const markStyle = (rect: MangaNoteRect) =>
    rect.w || rect.h
      ? {
          left: `${rect.x * 100}%`,
          top: `${rect.y * 100}%`,
          width: `${rect.w * 100}%`,
          height: `${rect.h * 100}%`,
        }
      : { left: `${rect.x * 100}%`, top: `${rect.y * 100}%` }
</script>

<template>
  <div
    ref="container"
    :class="
      cn(
        'relative touch-none overflow-hidden bg-inset select-none',
        drawable ? 'cursor-crosshair' : pannable && 'cursor-grab active:cursor-grabbing',
      )
    "
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  >
    <div
      ref="frame"
      class="absolute"
      :style="{
        left: `${box.left}px`,
        top: `${box.top}px`,
        width: `${box.width}px`,
        height: `${box.height}px`,
      }"
    >
      <img v-if="src" :src="src" :alt="alt" draggable="false" class="block size-full" />
      <div
        v-for="mark in marks"
        :key="mark.key"
        aria-hidden="true"
        :class="
          cn(
            'pointer-events-none absolute border-2 border-warning bg-warning/15',
            !mark.rect.w && !mark.rect.h && 'size-3 -translate-1/2 rounded-full bg-warning',
            mark.strong && 'ring-2 ring-warning/40',
          )
        "
        :style="markStyle(mark.rect)"
      />
    </div>
    <slot />
  </div>
</template>

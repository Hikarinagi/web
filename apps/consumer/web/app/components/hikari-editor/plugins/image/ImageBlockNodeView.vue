<script setup lang="ts">
  import { Pencil, Trash2 } from '@lucide/vue'
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
  import HikariContentNodesImage from '~/components/hikari-content/nodes/Image.vue'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { RESIZE_CORNERS, useImageResize } from './composables/useImageResize'

  defineOptions({ name: 'HikariEditorPluginsImageBlockNodeView' })

  const props = defineProps(nodeViewProps)
  const { openOverlay, closeOverlay } = useEditorOverlays()
  const imageRef = useTemplateRef<{ getFigure: () => HTMLElement | null }>('imageRef')
  const actionsRef = useTemplateRef<HTMLElement>('actionsRef')

  const adaptedNode = computed(() => ({
    type: props.node.type.name,
    attrs: props.node.attrs,
  }))

  const widthPercent = computed(() => {
    const v = props.node.attrs.width_percent
    return typeof v === 'number' && v > 0 ? v : 100
  })

  const figureRef = computed(() => imageRef.value?.getFigure() ?? null)

  const { startResize } = useImageResize(
    figureRef,
    () => widthPercent.value,
    next => props.updateAttributes({ width_percent: next }),
  )

  function openEdit() {
    if (!actionsRef.value) return
    openOverlay('image-meta', actionsRef.value, {
      initialAlt: props.node.attrs.alt as string | null,
      initialCaption: props.node.attrs.caption as string | null,
      initialWidthPercent: widthPercent.value,
      onChange: (patch: {
        alt?: string | null
        caption?: string | null
        width_percent?: number
      }) => {
        props.updateAttributes(patch)
      },
    })
  }

  function onDelete() {
    closeOverlay('image-meta')
    props.deleteNode()
  }
</script>

<template>
  <NodeViewWrapper as="div">
    <HikariContentNodesImage ref="imageRef" :node="adaptedNode" :selected="selected">
      <template #chrome>
        <div
          ref="actionsRef"
          class="absolute top-2 right-2 z-10 flex gap-1 transition-opacity duration-120 ease-out"
          :class="
            selected
              ? 'opacity-100'
              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100'
          "
        >
          <Button
            v-tooltip.top="'编辑'"
            unstyled
            type="button"
            class="inline-flex size-7 items-center justify-center rounded-md bg-black/55 text-white transition-colors duration-120 ease-out hover:bg-black/75"
            aria-label="编辑图片信息"
            @click="openEdit"
          >
            <Pencil class="size-4" />
          </Button>
          <Button
            v-tooltip.top="'删除'"
            unstyled
            type="button"
            class="inline-flex size-7 items-center justify-center rounded-md bg-black/55 text-white transition-colors duration-120 ease-out hover:bg-hikari-red-500"
            aria-label="删除图片"
            @click="onDelete"
          >
            <Trash2 class="size-4" />
          </Button>
        </div>
        <template v-if="selected">
          <span
            v-for="corner in RESIZE_CORNERS"
            :key="corner"
            :class="[
              'absolute z-20 size-3 rounded-sm border-[1.5px] border-(--editor-focus-ring) bg-white shadow-[0_1px_4px_rgb(0_0_0/0.4)]',
              corner === 'tl' && 'top-[-7px] left-[-7px] cursor-nwse-resize',
              corner === 'tr' && 'top-[-7px] right-[-7px] cursor-nesw-resize',
              corner === 'bl' && 'bottom-[-7px] left-[-7px] cursor-nesw-resize',
              corner === 'br' && 'right-[-7px] bottom-[-7px] cursor-nwse-resize',
            ]"
            @pointerdown="startResize(corner, $event)"
          />
        </template>
      </template>
    </HikariContentNodesImage>
  </NodeViewWrapper>
</template>

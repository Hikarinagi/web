<script setup lang="ts">
  import { Inline, Stack } from '@hina-ui/vue'
  import { Pencil, Trash2 } from '@lucide/vue'
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
  import HikariContentNodesImage from '~/components/hikari-content/nodes/Image.vue'
  import { useEditorOverlays } from '../../composables/useEditorOverlays'
  import { RESIZE_CORNERS, useImageResize } from './composables/useImageResize'
  import type { ComponentPublicInstance } from 'vue'

  defineOptions({ name: 'HikariEditorPluginsImageBlockNodeView' })

  const props = defineProps(nodeViewProps)
  const { openOverlay, closeOverlay } = useEditorOverlays()
  const imageRef = useTemplateRef<{ getFigure: () => HTMLElement | null }>('imageRef')
  const actionsRef = useTemplateRef<ComponentPublicInstance>('actionsRef')

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
    const anchor = unrefElement(actionsRef)
    if (!(anchor instanceof HTMLElement)) return
    openOverlay('image-meta', anchor, {
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
    <HikariContentNodesImage
      ref="imageRef"
      :node="adaptedNode"
      :selected="selected"
      :preview="false"
    >
      <template #chrome>
        <Inline
          ref="actionsRef"
          gap="xs"
          :wrap="false"
          class="absolute top-2 right-2 z-10 transition-opacity duration-120 ease-out"
          :class="
            selected
              ? 'opacity-100'
              : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100'
          "
        >
          <HikariEditorNodeViewChromeButton label="编辑图片信息" @click="openEdit">
            <Pencil />
          </HikariEditorNodeViewChromeButton>
          <HikariEditorNodeViewChromeButton label="删除图片" tone="danger" @click="onDelete">
            <Trash2 />
          </HikariEditorNodeViewChromeButton>
        </Inline>
        <template v-if="selected">
          <Stack
            v-for="corner in RESIZE_CORNERS"
            :key="corner"
            gap="none"
            :class="
              cn(
                'absolute z-20 size-3 rounded-sm border-2 border-(--editor-focus-ring) bg-white shadow-sm',
                corner === 'tl' && '-top-1.75 -left-1.75 cursor-nwse-resize',
                corner === 'tr' && '-top-1.75 -right-1.75 cursor-nesw-resize',
                corner === 'bl' && '-bottom-1.75 -left-1.75 cursor-nesw-resize',
                corner === 'br' && '-right-1.75 -bottom-1.75 cursor-nwse-resize',
              )
            "
            @pointerdown="startResize(corner, $event)"
          />
        </template>
      </template>
    </HikariContentNodesImage>
  </NodeViewWrapper>
</template>

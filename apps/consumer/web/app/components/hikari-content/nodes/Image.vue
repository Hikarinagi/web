<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesImage' })

  const props = withDefaults(
    defineProps<{
      node: EditorNode
      eager?: boolean
      selected?: boolean
    }>(),
    { eager: false, selected: false },
  )

  const src = computed(() => (props.node.attrs?.src as string | undefined) ?? '')
  const alt = computed(() => (props.node.attrs?.alt as string | null | undefined) ?? '')
  const caption = computed(() => (props.node.attrs?.caption as string | null | undefined) ?? null)
  const width = computed(() => {
    const w = props.node.attrs?.width
    return typeof w === 'number' && w > 0 ? w : null
  })
  const height = computed(() => {
    const h = props.node.attrs?.height
    return typeof h === 'number' && h > 0 ? h : null
  })
  const widthPercent = computed(() => {
    const w = props.node.attrs?.width_percent
    return typeof w === 'number' && w > 0 ? w : 100
  })
  const mediaAssetId = computed(() => {
    const id = props.node.attrs?.media_asset_id
    return typeof id === 'number' ? String(id) : ''
  })

  const figureStyle = computed(() => {
    const style: Record<string, string> = { width: `${widthPercent.value}%` }
    if (width.value && height.value) {
      style.aspectRatio = `${width.value} / ${height.value}`
    }
    if (props.selected) {
      style.boxShadow = '0 0 0 4px color-mix(in srgb, var(--editor-focus-ring) 25%, transparent)'
    }
    return style
  })

  const preloadOption = computed(() => (props.eager ? { fetchPriority: 'high' as const } : false))

  const figureRef = useTemplateRef<HTMLElement>('figureRef')
  defineExpose({ getFigure: () => figureRef.value })
</script>

<template>
  <figure
    ref="figureRef"
    class="group relative mx-auto my-[0.8em] overflow-hidden rounded-(--editor-panel-radius) border-[1.5px] bg-(--editor-toolbar-bg) transition-[border-color,box-shadow] duration-120 ease-out"
    :class="[selected ? 'border-(--editor-focus-ring)' : 'border-transparent']"
    data-card-type="image"
    :data-media-asset-id="mediaAssetId"
    :style="figureStyle"
  >
    <HikariImage
      :src="src"
      :alt="alt"
      preset="large"
      :lazy="!eager"
      :preload="preloadOption"
      :skeleton="!eager"
      class="block size-full"
      image-class="size-full object-contain"
      preview
    />
    <slot name="chrome" />
  </figure>
  <figcaption v-if="caption" class="mt-1.5 text-center text-sm text-(--editor-text-muted) italic">
    {{ caption }}
  </figcaption>
</template>

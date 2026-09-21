<script setup lang="ts">
  import { CodeBlock, Grid, SegmentedControl, Stack, Text, VisuallyHidden } from '@hina-ui/vue'
  import { Code, Columns2, Workflow } from '@lucide/vue'
  import { layoutMermaid } from '~/features/mermaid/layout'
  import { parseMermaid } from '~/features/mermaid/parse'
  import { useDiagramViewport } from '~/features/mermaid/useDiagramViewport'
  import MermaidDiagramGraph from './mermaid-diagram/Graph.vue'
  import MermaidDiagramToolbar from './mermaid-diagram/Toolbar.vue'

  defineOptions({ name: 'MermaidDiagram' })

  type ViewMode = 'diagram' | 'split' | 'code'

  const props = withDefaults(
    defineProps<{ source: string; alt: string; defaultMode?: ViewMode }>(),
    { defaultMode: 'diagram' },
  )

  const MODES = [
    { value: 'diagram', label: '图', icon: Workflow },
    { value: 'split', label: '图与源码', icon: Columns2 },
    { value: 'code', label: '源码', icon: Code },
  ]
  const PANEL_HEIGHT = 'clamp(17rem, 27vw, 24rem)'

  const mode = ref<ViewMode>(props.defaultMode)
  const layout = computed(() => layoutMermaid(parseMermaid(props.source)))
  const frame = useTemplateRef<HTMLElement>('frame')
  const { transform, dragging, zoomBy, reset } = useDiagramViewport(frame, () => layout.value)
</script>

<template>
  <Stack as="figure" gap="none" class="group/figure relative">
    <Stack
      gap="none"
      class="absolute top-3 left-3 z-20 opacity-0 transition-opacity group-hover/figure:opacity-100 focus-within:opacity-100 max-lg:opacity-100"
    >
      <SegmentedControl v-model="mode" :options="MODES" size="sm" aria-label="视图模式">
        <template #option="{ option }">
          <component :is="option.icon" class="size-4" />
          <VisuallyHidden>{{ option.label }}</VisuallyHidden>
        </template>
      </SegmentedControl>
    </Stack>

    <Grid :cols="1" gap="none" :class="cn('gap-3', mode === 'split' && 'lg:grid-cols-2')">
      <div
        v-show="mode !== 'code'"
        ref="frame"
        class="group relative touch-none overflow-hidden rounded-2xl border border-line bg-canvas hikari-dot-grid focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
        :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
        :style="{ height: PANEL_HEIGHT }"
        tabindex="0"
        role="img"
        :aria-label="alt"
      >
        <MermaidDiagramGraph :layout :transform />
        <MermaidDiagramToolbar @zoom="zoomBy" @reset="reset" />
      </div>

      <CodeBlock
        v-show="mode !== 'diagram'"
        :code="source.trim()"
        :style="{ height: PANEL_HEIGHT }"
      />
    </Grid>

    <Text as="figcaption" class="sr-only">{{ alt }}</Text>
  </Stack>
</template>

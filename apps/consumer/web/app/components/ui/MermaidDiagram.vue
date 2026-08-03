<script setup lang="ts">
  import { Code, Columns2, Workflow } from '@lucide/vue'
  import { layoutMermaid } from '~/features/mermaid/layout'
  import { parseMermaid } from '~/features/mermaid/parse'
  import { useDiagramViewport } from '~/features/mermaid/useDiagramViewport'
  import MermaidDiagramGraph from './mermaid-diagram/Graph.vue'
  import MermaidDiagramSourcePanel from './mermaid-diagram/SourcePanel.vue'
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
  <figure class="group/figure relative">
    <div
      class="mode-switch absolute top-3 left-3 z-20 opacity-0 transition-opacity group-hover/figure:opacity-100 focus-within:opacity-100 max-lg:opacity-100"
    >
      <SelectButton
        v-model="mode"
        :options="MODES"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        size="small"
        aria-label="视图模式"
      >
        <template #option="{ option }">
          <component :is="option.icon" class="size-4" />
          <span class="sr-only">{{ option.label }}</span>
        </template>
      </SelectButton>
    </div>

    <div class="grid gap-3" :class="mode === 'split' ? 'lg:grid-cols-2' : 'grid-cols-1'">
      <div
        v-show="mode !== 'code'"
        ref="frame"
        class="diagram group relative touch-none overflow-hidden rounded-2xl border border-surface bg-surface-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-hikari-primary-500 dark:bg-surface-950"
        :class="dragging ? 'cursor-grabbing' : 'cursor-grab'"
        :style="{ height: PANEL_HEIGHT }"
        tabindex="0"
        role="img"
        :aria-label="alt"
      >
        <MermaidDiagramGraph :layout :transform />
        <MermaidDiagramToolbar @zoom="zoomBy" @reset="reset" />
      </div>

      <MermaidDiagramSourcePanel
        v-show="mode !== 'diagram'"
        :source
        :style="{ height: PANEL_HEIGHT }"
      />
    </div>

    <figcaption class="sr-only">{{ alt }}</figcaption>
  </figure>
</template>

<style scoped>
  .mode-switch :deep(.p-togglebutton:focus:not(:focus-visible)) {
    outline: none;
    box-shadow: none;
  }

  .diagram {
    background-image: radial-gradient(currentColor 1px, transparent 1px);
    background-size: 22px 22px;
    color: color-mix(in oklab, var(--p-surface-500) 22%, transparent);
  }
</style>

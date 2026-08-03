<script setup lang="ts">
  import type { MermaidLayout } from '~/features/mermaid/layout'

  defineOptions({ name: 'MermaidDiagramGraph' })
  defineProps<{ layout: MermaidLayout; transform: string }>()

  const TONE: Record<string, string> = { start: '#39c5bb', app: '#39c5bb', user: '#66ccff' }
  const toneOf = (variant?: string) => (variant && TONE[variant]) || '#94a3b8'
  const uid = useId()

  const diamondPoints = (node: MermaidLayout['nodes'][number]) =>
    [
      `${node.x + node.width / 2},${node.y}`,
      `${node.x + node.width},${node.y + node.height / 2}`,
      `${node.x + node.width / 2},${node.y + node.height}`,
      `${node.x},${node.y + node.height / 2}`,
    ].join(' ')

  const cornerRadius = (shape: string, height: number) => {
    if (shape === 'stadium') return height / 2
    return shape === 'round' ? 14 : 10
  }
</script>

<template>
  <svg
    :viewBox="`0 0 ${layout.width} ${layout.height}`"
    preserveAspectRatio="xMidYMid meet"
    class="absolute inset-0 size-full select-none"
    aria-hidden="true"
  >
    <defs>
      <marker
        v-for="[key, color] in Object.entries({ ...TONE, none: '#94a3b8' })"
        :id="`${uid}-arrow-${key}`"
        :key="key"
        markerWidth="7"
        markerHeight="6"
        refX="6.5"
        refY="3"
        orient="auto"
      >
        <path d="M0 0 L7 3 L0 6 Z" :fill="color" fill-opacity="0.9" />
      </marker>
    </defs>

    <g :transform="transform">
      <path
        v-for="edge in layout.edges"
        :key="edge.id"
        :d="edge.d"
        fill="none"
        stroke-width="2"
        :stroke="toneOf(edge.variant)"
        stroke-opacity="0.28"
        :stroke-dasharray="edge.dashed ? '6 5' : undefined"
        :marker-end="edge.arrow ? `url(#${uid}-arrow-${edge.variant ?? 'none'})` : undefined"
      />

      <template v-for="edge in layout.edges" :key="`${edge.id}-label`">
        <g v-if="edge.label">
          <rect
            :x="edge.labelX - edge.labelWidth / 2"
            :y="edge.labelY - 11"
            :width="edge.labelWidth"
            :height="22"
            rx="11"
            class="fill-surface-50 dark:fill-surface-950"
            :stroke="toneOf(edge.variant)"
            stroke-opacity="0.35"
          />
          <text
            :x="edge.labelX"
            :y="edge.labelY"
            text-anchor="middle"
            dominant-baseline="central"
            class="text-[11px] font-medium"
            :fill="toneOf(edge.variant)"
          >
            {{ edge.label }}
          </text>
        </g>
      </template>

      <g v-for="node in layout.nodes" :key="node.id">
        <polygon
          v-if="node.shape === 'diamond'"
          :points="diamondPoints(node)"
          stroke-width="1.5"
          :stroke="toneOf(node.variant)"
          stroke-opacity="0.55"
          :fill="toneOf(node.variant)"
          fill-opacity="0.12"
        />
        <rect
          v-else
          :x="node.x"
          :y="node.y"
          :width="node.width"
          :height="node.height"
          :rx="cornerRadius(node.shape, node.height)"
          stroke-width="1.5"
          :stroke="toneOf(node.variant)"
          stroke-opacity="0.55"
          :fill="toneOf(node.variant)"
          fill-opacity="0.12"
        />
        <text
          :x="node.x + node.width / 2"
          :y="node.y + node.height / 2"
          text-anchor="middle"
          dominant-baseline="central"
          class="fill-surface-900 text-[15px] font-semibold dark:fill-surface-50"
        >
          {{ node.label }}
        </text>
      </g>
    </g>
  </svg>
</template>

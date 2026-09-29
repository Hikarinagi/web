<script setup lang="ts">
  import { boundsOf, type Point } from '~/features/workbench/manga/geometry'
  import { cn } from '~/utils/cn'

  const props = defineProps<{
    id: string
    vertices: Point[]
    x: number
    y: number
    index: number
    width: number
    height: number
    selected: boolean
    locked: boolean
    handle: boolean
  }>()

  const radius = computed(() => Math.min(props.width, props.height) * 0.016)
  const points = computed(() =>
    props.vertices.map(([px, py]) => `${px * props.width},${py * props.height}`).join(' '),
  )
  const bounds = computed(() => boundsOf(props.vertices, props.x, props.y))
  const badge = computed(() =>
    props.vertices.length >= 3
      ? { x: bounds.value.x0 * props.width, y: bounds.value.y0 * props.height }
      : { x: props.x * props.width, y: props.y * props.height },
  )
</script>

<template>
  <g :data-region-id="id" class="cursor-pointer">
    <polygon
      v-if="vertices.length >= 3"
      :points="points"
      vector-effect="non-scaling-stroke"
      :stroke-width="selected ? 3 : 1.5"
      :class="
        cn(
          'fill-accent/10 stroke-accent',
          selected && 'fill-accent/25',
          locked && 'fill-warning/15 stroke-warning',
        )
      "
    />
    <circle
      :cx="badge.x"
      :cy="badge.y"
      :r="radius"
      :class="cn('fill-accent', locked && 'fill-warning')"
    />
    <text
      :x="badge.x"
      :y="badge.y"
      :font-size="radius * 1.1"
      text-anchor="middle"
      dominant-baseline="central"
      class="pointer-events-none fill-accent-on font-semibold select-none"
    >
      {{ index + 1 }}
    </text>
    <rect
      v-if="handle && vertices.length >= 3"
      data-handle="resize"
      :x="bounds.x1 * width - radius / 2"
      :y="bounds.y1 * height - radius / 2"
      :width="radius"
      :height="radius"
      vector-effect="non-scaling-stroke"
      stroke-width="2"
      class="cursor-nwse-resize fill-surface stroke-accent"
    />
  </g>
</template>

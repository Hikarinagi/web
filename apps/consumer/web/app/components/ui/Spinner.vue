<script setup lang="ts">
  import type { ClassValue } from 'clsx'

  defineOptions({ name: 'UiSpinner', inheritAttrs: false })

  withDefaults(
    defineProps<{
      size?: number
      label?: string | null
    }>(),
    {
      size: 24,
      label: '加载中',
    },
  )

  const attrs = useAttrs()
  const rootClass = computed(() =>
    cn(
      'inline-block shrink-0 animate-spin text-primary [animation-duration:0.7s]',
      attrs.class as ClassValue,
    ),
  )
  const rootAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })

  const R = 9.5
  const ARC = 2 * Math.PI * R * 0.25
  const GAP = 2 * Math.PI * R
</script>

<template>
  <svg
    v-bind="rootAttrs"
    :class="rootClass"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="label ? undefined : true"
  >
    <circle cx="12" cy="12" :r="R" stroke="currentColor" stroke-width="2.5" class="opacity-20" />
    <circle
      cx="12"
      cy="12"
      :r="R"
      stroke="currentColor"
      stroke-width="2.5"
      stroke-linecap="round"
      :stroke-dasharray="`${ARC} ${GAP}`"
    />
  </svg>
</template>

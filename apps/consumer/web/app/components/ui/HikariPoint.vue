<script setup lang="ts">
  import type { ClassValue } from 'clsx'
  import hikariPointUrl from '~/assets/images/hikari-point.webp'

  defineOptions({ name: 'HikariPoint', inheritAttrs: false })

  withDefaults(
    defineProps<{
      alt?: string
      whiteBackground?: boolean
    }>(),
    {
      alt: '',
      whiteBackground: true,
    },
  )

  const attrs = useAttrs()
  const rootClass = computed(() =>
    cn('relative inline-block size-5 shrink-0 align-[-0.125em]', attrs.class as ClassValue),
  )
  const rootAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
</script>

<template>
  <span v-bind="rootAttrs" :class="rootClass">
    <span
      v-if="whiteBackground"
      class="pointer-events-none absolute inset-[8%] bg-white [clip-path:polygon(50%_0%,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]"
      aria-hidden="true"
    />
    <img
      :src="hikariPointUrl"
      :alt="alt"
      class="relative size-full object-contain select-none"
      draggable="false"
    />
  </span>
</template>

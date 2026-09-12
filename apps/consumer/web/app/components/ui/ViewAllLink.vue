<script setup lang="ts">
  import { ArrowRight } from '@lucide/vue'
  import type { ClassValue } from 'clsx'
  import { cn } from '~/utils/cn'

  defineOptions({
    name: 'HikariViewAllLink',
    inheritAttrs: false,
  })

  defineProps<{
    to: string
    iconClass?: ClassValue
  }>()

  const attrs = useAttrs()

  const rootClass = computed(() =>
    cn(
      'group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-hikari-primary-600 transition-colors hover:text-hikari-primary-700 dark:text-hikari-primary-400',
      attrs.class as ClassValue,
    ),
  )

  const forwardedAttrs = computed(() => {
    const { class: _class, ...rest } = attrs
    return rest
  })
</script>

<template>
  <NuxtLink :to="to" v-bind="forwardedAttrs" :class="rootClass">
    <slot>查看全部</slot>
    <ArrowRight :class="cn('size-4 transition-transform group-hover:translate-x-0.5', iconClass)" />
  </NuxtLink>
</template>

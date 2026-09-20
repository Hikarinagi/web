<script setup lang="ts">
  defineOptions({ name: 'LightNovelExploreSection' })
  withDefaults(
    defineProps<{
      title: string
      meta?: string
      to?: string
      gap?: 'normal' | 'loose'
    }>(),
    { gap: 'normal', meta: undefined, to: undefined },
  )
</script>

<template>
  <section class="flex flex-col" :class="gap === 'loose' ? 'gap-6' : 'gap-4'">
    <div class="flex items-baseline gap-3">
      <h2 class="text-2xl font-bold text-surface-950 dark:text-white">{{ title }}</h2>
      <p v-if="meta" class="text-sm text-surface-500 dark:text-surface-400">{{ meta }}</p>
      <ViewAllLink v-if="to" :to="to" class="ml-auto" />
    </div>
    <slot />
  </section>
</template>

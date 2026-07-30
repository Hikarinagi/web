<script setup lang="ts">
  defineOptions({ name: 'MangaHomeSection' })
  defineProps<{
    title: string
    meta?: string
    to?: string
  }>()
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-baseline gap-3">
      <h2 class="text-2xl font-bold text-surface-950 dark:text-white">{{ title }}</h2>
      <p v-if="meta" class="text-sm text-muted-color">{{ meta }}</p>
      <slot name="actions">
        <ViewAllLink v-if="to" :to="to" class="ml-auto" />
      </slot>
    </div>
    <slot />
  </section>
</template>

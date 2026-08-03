<script setup lang="ts">
  defineOptions({ name: 'GalgameExploreSection' })
  defineProps<{
    title: string
    to?: string
  }>()
</script>

<template>
  <section class="flex flex-col gap-4">
    <div class="flex items-baseline gap-3">
      <h2 class="text-2xl font-bold text-color">{{ title }}</h2>
      <ViewAllLink v-if="to" :to="to" class="ml-auto" />
    </div>
    <slot />
  </section>
</template>

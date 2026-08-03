<script setup lang="ts">
  defineOptions({ name: 'GalgameExploreRailViewport' })
  withDefaults(defineProps<{ contentClass?: string }>(), {
    contentClass: 'flex min-w-max gap-4 px-6 pb-2',
  })
</script>

<template>
  <ScrollArea axis="x" shadow="end" arrows class="-mx-6">
    <div :class="contentClass">
      <slot />
    </div>
  </ScrollArea>
</template>

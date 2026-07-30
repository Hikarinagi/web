<script setup lang="ts">
  import ImagePlaygroundPreview from './playground/ImagePlaygroundPreview.vue'
  import ImagePlaygroundProcessing from './playground/ImagePlaygroundProcessing.vue'
  import ImagePlaygroundSources from './playground/ImagePlaygroundSources.vue'
  import ImagePlaygroundStates from './playground/ImagePlaygroundStates.vue'
</script>

<template>
  <div class="space-y-8 py-10">
    <header class="space-y-2">
      <p class="text-sm font-medium text-muted-color">Hikarinagi UI</p>
      <h1 class="text-3xl font-semibold tracking-normal text-color">Image Playground</h1>
    </header>

    <ImagePlaygroundSources />
    <ImagePlaygroundProcessing />
    <ImagePlaygroundPreview />
    <ImagePlaygroundStates />
  </div>
</template>

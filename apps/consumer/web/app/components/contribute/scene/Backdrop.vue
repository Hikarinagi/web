<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { SCENE_MOMENTS } from '~/features/contribute/moments'
  import Resident from './Resident.vue'

  defineProps<{ moment: string; fade: number }>()
  defineEmits<{ ready: [id: string] }>()
</script>

<template>
  <Stack gap="none" class="scene-world" aria-hidden="true">
    <Stack gap="none" class="scene-canvas" :data-moment="moment">
      <Stack gap="none" class="scene-shelves" />
      <Resident
        v-for="item in SCENE_MOMENTS"
        :key="item.id"
        :item="item"
        :visible="moment === item.id"
        :fade="fade"
        @ready="$emit('ready', item.id)"
      />
      <ContributeSceneVisitor
        :visible="moment === 'desk'"
        :fade="fade"
        @ready="$emit('ready', 'desk')"
      />
      <ContributeSceneVisitor
        smile
        :visible="moment === 'desk-smile'"
        :fade="fade"
        @ready="$emit('ready', 'desk-smile')"
      />
    </Stack>
  </Stack>
  <Stack gap="none" class="scene-overlay" aria-hidden="true">
    <Stack gap="none" class="scene-canvas scene-canvas--bare">
      <ContributeSceneVisitor hands :visible="moment === 'desk'" :fade="fade" />
    </Stack>
  </Stack>
</template>

<style scoped>
  .scene-world {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    container-type: size;
    z-index: 0;
  }
  .scene-canvas {
    --contribute-frame-anchor: 0.5;
    position: absolute;
    width: var(--contribute-art-width);
    aspect-ratio: var(--contribute-art-ratio);
    left: calc(50% - var(--contribute-art-width) / 2);
    bottom: calc(
      var(--contribute-art-width) / (var(--contribute-art-ratio)) *
        (var(--contribute-counter-line) - 1)
    );
    background: var(--color-contribute-floor);
  }
  .scene-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow-x: clip;
    container-type: size;
    z-index: 1;
  }
  .scene-canvas--bare {
    background: none;
  }
  .scene-shelves {
    position: absolute;
    inset: 0 0 auto;
    width: 100%;
    height: var(--contribute-shelf-height);
    background-color: var(--color-contribute-shadow);
    background-image: url('/images/contribute/background.webp');
    background-size: auto 100%;
    background-position: center bottom;
    background-repeat: repeat-x;
  }
  @media (max-width: 48rem) {
    .scene-canvas {
      --contribute-frame-anchor: var(--contribute-mobile-anchor);
      left: calc(50% - var(--contribute-art-width) * var(--contribute-mobile-anchor));
    }
  }
</style>

<script setup lang="ts">
  import { Image } from '@hina-ui/vue'
  import { motion } from 'motion-v'
  import type { SCENE_MOMENTS } from '~/features/contribute/moments'

  defineProps<{ item: (typeof SCENE_MOMENTS)[number]; visible: boolean; fade: number }>()
  defineEmits<{ ready: [] }>()
</script>

<template>
  <motion.div
    class="scene-resident"
    :data-scene-layer="item.id"
    :style="{
      '--actor-x': item.position,
      '--actor-width': `${item.width}%`,
      '--actor-ratio': item.ratio,
      '--actor-anchor': `${item.anchor}%`,
      '--actor-depth': `${item.depth}%`,
      '--shadow-x': `${item.shadow.x}%`,
      '--shadow-y': `${item.shadow.y}%`,
      '--shadow-width': `${item.shadow.width}%`,
      '--shadow-height': `${item.shadow.height}%`,
      '--contact-width': `${item.shadow.contact_width}%`,
      '--contact-height': `${item.shadow.contact_height}%`,
    }"
    :initial="false"
    :animate="{ opacity: visible ? 1 : 0 }"
    :transition="{ duration: fade, ease: 'easeInOut' }"
  >
    <Image
      :src="item.src"
      alt=""
      eager
      :lazy="false"
      :skeleton="false"
      class="size-full"
      image-class="size-full object-contain"
      @load="$emit('ready')"
    />
  </motion.div>
</template>

<style scoped>
  .scene-resident {
    position: absolute;
    left: calc(
      var(--contribute-art-width) * var(--contribute-frame-anchor) + 100cqw * (var(--actor-x) - 0.5)
    );
    top: calc(var(--contribute-shelf-height) + var(--actor-depth));
    width: var(--actor-width);
    aspect-ratio: var(--actor-ratio);
    transform: translate(-50%, calc(-1 * var(--actor-anchor)));
    isolation: isolate;
    z-index: 1;
  }
  .scene-resident::before,
  .scene-resident::after {
    content: '';
    position: absolute;
    z-index: -1;
    top: var(--shadow-y);
    left: var(--shadow-x);
    transform: translate(-50%, -50%);
    background: radial-gradient(
      ellipse at center,
      var(--color-contribute-contact-shadow),
      transparent 70%
    );
  }
  .scene-resident::before {
    width: var(--shadow-width);
    height: var(--shadow-height);
    opacity: 0.5;
  }
  .scene-resident::after {
    width: var(--contact-width);
    height: var(--contact-height);
  }
</style>

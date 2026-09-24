<script setup lang="ts">
  import { Image } from '@hina-ui/vue'
  import { motion } from 'motion-v'

  defineProps<{ visible: boolean; fade: number; smile?: boolean }>()
  defineEmits<{ ready: [] }>()
</script>

<template>
  <motion.div
    v-for="layer in smile ? ['body'] : ['body', 'left-hand', 'right-hand']"
    :key="layer"
    :class="cn('scene-visitor', `scene-visitor--${layer}`)"
    :initial="false"
    :animate="{ opacity: visible ? 1 : 0 }"
    :transition="{ duration: fade, ease: 'easeInOut' }"
    :data-scene-layer="`${smile ? 'desk-smile' : 'desk'}-${layer}`"
  >
    <Image
      :src="smile ? '/images/contribute/shion/10.webp' : '/images/contribute/shion/09.webp'"
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
  .scene-visitor {
    position: absolute;
    left: var(--contribute-visitor-x);
    top: var(--contribute-visitor-top);
    width: var(--contribute-visitor-width);
    aspect-ratio: var(--contribute-visitor-ratio);
    z-index: 1;
  }
  /* The same alpha artwork straddles the fixed table: torso behind, palms above. */
  .scene-visitor--left-hand {
    z-index: 3;
    clip-path: var(--contribute-left-hand-crop);
    filter: drop-shadow(var(--contribute-hand-shadow));
  }
  .scene-visitor--right-hand {
    z-index: 3;
    clip-path: var(--contribute-right-hand-crop);
    filter: drop-shadow(var(--contribute-hand-shadow));
  }
</style>

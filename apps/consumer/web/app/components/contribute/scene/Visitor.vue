<script setup lang="ts">
  import { Image } from '@hina-ui/vue'
  import { motion } from 'motion-v'

  const props = defineProps<{ visible: boolean; fade: number; smile?: boolean; hands?: boolean }>()
  defineEmits<{ ready: [] }>()

  const layers = computed(() => (props.hands ? ['left-hand', 'right-hand'] : ['body']))
</script>

<template>
  <motion.div
    v-for="layer in layers"
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
  .scene-visitor--left-hand {
    clip-path: var(--contribute-left-hand-crop);
    filter: drop-shadow(var(--contribute-hand-shadow));
  }
  .scene-visitor--right-hand {
    clip-path: var(--contribute-right-hand-crop);
    filter: drop-shadow(var(--contribute-hand-shadow));
  }
</style>

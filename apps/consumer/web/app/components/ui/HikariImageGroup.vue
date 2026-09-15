<script setup lang="ts">
  import { ImageGroup } from '@hina-ui/vue'

  defineOptions({ name: 'HikariImageGroup', inheritAttrs: false })

  defineProps<{ loop?: boolean }>()
</script>

<template>
  <ImageGroup :loop="loop">
    <div :class="$attrs.class as string">
      <slot />
    </div>
  </ImageGroup>
</template>

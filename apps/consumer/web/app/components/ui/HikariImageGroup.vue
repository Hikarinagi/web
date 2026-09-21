<script setup lang="ts">
  import { ImageGroup, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'HikariImageGroup', inheritAttrs: false })

  defineProps<{ loop?: boolean }>()
</script>

<template>
  <ImageGroup :loop="loop">
    <Stack gap="none" :class="$attrs.class as string">
      <slot />
    </Stack>
  </ImageGroup>
</template>

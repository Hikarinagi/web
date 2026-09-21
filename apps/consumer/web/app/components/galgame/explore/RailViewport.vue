<script setup lang="ts">
  import { Flex } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameExploreRailViewport' })
  withDefaults(defineProps<{ contentClass?: string }>(), {
    contentClass: 'flex min-w-max gap-4 px-6 pb-2',
  })
</script>

<template>
  <ScrollRail class="-mx-6">
    <Flex gap="none" :class="contentClass">
      <slot />
    </Flex>
  </ScrollRail>
</template>

<script setup lang="ts">
  import { LoadingOverlay } from '@hina-ui/vue'

  defineOptions({ name: 'HikariLoadingOverlay', inheritAttrs: false })

  const attrs = useAttrs()
  const forwarded = computed<Record<string, unknown>>(() => ({ delay: 0, ...attrs }))
</script>

<template>
  <LoadingOverlay v-bind="forwarded">
    <template v-if="$slots.default" #default><slot /></template>
  </LoadingOverlay>
</template>

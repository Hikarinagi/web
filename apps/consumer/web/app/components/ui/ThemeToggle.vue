<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'

  const { current, cycle } = useThemeMode()
</script>

<template>
  <IconButton :label="current.label" pill @click="cycle">
    <component :is="current.icon" aria-hidden="true" />
  </IconButton>
</template>

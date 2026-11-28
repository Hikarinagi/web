<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'

  const { current, cycle } = useThemeMode()
  const { t } = useLocaleText()
</script>

<template>
  <IconButton :label="t(current.label)" pill @click="cycle">
    <component :is="current.icon" aria-hidden="true" />
  </IconButton>
</template>

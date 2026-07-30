<script setup lang="ts">
  const { current, cycle } = useThemeMode()
</script>

<template>
  <Button
    v-tooltip="current.label"
    :aria-label="current.label"
    rounded
    severity="secondary"
    variant="text"
    @click="cycle"
  >
    <template #icon>
      <component :is="current.icon" class="text-color" aria-hidden="true" />
    </template>
  </Button>
</template>

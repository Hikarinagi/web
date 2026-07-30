<script setup lang="ts">
  import { isApiError } from '~/utils/api/error'

  onErrorCaptured(error => {
    if (import.meta.client && isApiError(error)) return false
  })
</script>

<template>
  <slot />
</template>

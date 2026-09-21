<script setup lang="ts">
  import { Button } from '@hina-ui/vue'

  defineOptions({ name: 'ResourceArchiveExternalChip' })

  defineProps<{ href: string }>()
</script>

<template>
  <Button
    as="a"
    :href="href"
    target="_blank"
    rel="noopener noreferrer"
    variant="outline"
    tone="neutral"
    size="sm"
  >
    <slot />
  </Button>
</template>

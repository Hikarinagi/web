<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'

  defineOptions({ name: 'HikariEditorNodeViewChromeButton' })

  withDefaults(defineProps<{ label: string; tone?: 'neutral' | 'danger' }>(), { tone: 'neutral' })
</script>

<template>
  <IconButton
    :label
    size="sm"
    class="bg-black/55 text-white"
    :class="tone === 'danger' ? 'hover:bg-hikari-red-500' : undefined"
  >
    <slot />
  </IconButton>
</template>

<script setup lang="ts">
  import { Button, Inline, Text } from '@hina-ui/vue'
  import { useMediaLibrary } from './composables/useMediaLibrary'

  defineOptions({ name: 'MediaLibraryActions' })

  const { selected, confirmLabel, finish } = useMediaLibrary()
</script>

<template>
  <Inline gap="sm" align="center" class="w-full">
    <Text as="span" size="sm" tone="muted" class="me-auto">已选 {{ selected.length }}</Text>
    <Button variant="ghost" tone="neutral" @click="finish([])">取消</Button>
    <Button :disabled="!selected.length" @click="finish(selected)">{{ confirmLabel }}</Button>
  </Inline>
</template>

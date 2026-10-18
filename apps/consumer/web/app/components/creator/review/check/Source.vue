<script setup lang="ts">
  import { Link, Text } from '@hina-ui/vue'
  import type { BackendCheckSource } from '~/features/creator/check'

  const props = defineProps<{ source: BackendCheckSource; long?: boolean }>()

  const label = computed(() => {
    const { source } = props
    if (source.kind === 'bangumi') {
      return [`Bangumi ${source.ref}`, props.long ? source.title : null].filter(Boolean).join(' ')
    }
    if (source.kind === 'openbd') return `openBD ${source.ref}`
    if (source.title) return source.title
    try {
      return source.url ? new URL(source.url).hostname : ''
    } catch {
      return source.url ?? ''
    }
  })
</script>

<template>
  <Text v-if="source.kind === 'request'" as="span" size="sm" tone="muted">请求中的书名</Text>
  <Link
    v-else-if="source.url"
    :href="source.url"
    target="_blank"
    rel="noopener noreferrer"
    class="text-sm"
  >
    {{ label }}
  </Link>
  <Text v-else as="span" size="sm" tone="muted">{{ label }}</Text>
</template>

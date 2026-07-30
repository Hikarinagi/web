<script setup lang="ts">
  import {
    HIKARI_IMAGE_GROUP_KEY,
    useHikariImagePreview,
    type HikariImagePreviewItem,
  } from './hikari-image/composables/usePreview'

  defineOptions({ name: 'HikariImageGroup', inheritAttrs: false })

  const rootRef = ref<HTMLElement | null>(null)
  const registry = new Map<string, HikariImagePreviewItem>()
  const preview = useHikariImagePreview()

  function orderedItems() {
    const root = rootRef.value
    if (!root) return [...registry.values()]
    const ordered = [...root.querySelectorAll<HTMLElement>('[data-hikari-image-id]')]
      .map(node => registry.get(node.dataset.hikariImageId ?? ''))
      .filter((item): item is HikariImagePreviewItem => Boolean(item))
    const seen = new Set(ordered.map(item => item.id))
    for (const item of registry.values()) if (!seen.has(item.id)) ordered.push(item)
    return ordered
  }

  provide(HIKARI_IMAGE_GROUP_KEY, {
    register: item => {
      registry.set(item.id, item)
    },
    unregister: id => {
      registry.delete(id)
    },
    open: id => {
      const items = orderedItems()
      const index = items.findIndex(item => item.id === id)
      if (index === -1) return
      preview.open(items, index)
    },
  })
</script>

<template>
  <div ref="rootRef" :class="$attrs.class as string">
    <slot />
  </div>
</template>

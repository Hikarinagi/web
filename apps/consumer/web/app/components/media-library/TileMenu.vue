<script setup lang="ts">
  import { ContextMenu, ContextMenuItem, ContextMenuSeparator } from '@hina-ui/vue'
  import { Check, Download, ExternalLink, Link, Trash2, X } from '@lucide/vue'
  import type { MediaValue } from './types'

  defineOptions({ name: 'MediaLibraryTileMenu' })

  const props = defineProps<{
    media: MediaValue | null
    targets: MediaValue[]
    selected: boolean
  }>()
  const emit = defineEmits<{
    toggle: [media: MediaValue]
    open: [media: MediaValue]
    copy: [media: MediaValue]
    download: [items: MediaValue[]]
    remove: [items: MediaValue[]]
  }>()

  const open = ref(false)
  const entry = shallowRef<{
    media: MediaValue
    targets: MediaValue[]
    selected: boolean
  } | null>(null)

  watch(open, value => {
    if (!value) return
    entry.value = props.media
      ? { media: props.media, targets: props.targets, selected: props.selected }
      : null
  })

  const count = computed(() => entry.value?.targets.length ?? 0)
  const batch = computed(() => count.value > 1)
  const countLabel = computed(() => (batch.value ? ` ${count.value} 张` : ''))
</script>

<template>
  <ContextMenu v-model:open="open" label="图片操作">
    <slot />

    <template v-if="entry" #content>
      <ContextMenuItem @select="emit('toggle', entry.media)">
        <template #icon>
          <X v-if="entry.selected" />
          <Check v-else />
        </template>
        {{ entry.selected ? '取消选择' : '选择' }}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem v-if="!batch" @select="emit('open', entry.media)">
        <template #icon><ExternalLink /></template>
        在新标签页打开
      </ContextMenuItem>

      <ContextMenuItem v-if="!batch" @select="emit('copy', entry.media)">
        <template #icon><Link /></template>
        复制图片链接
      </ContextMenuItem>

      <ContextMenuItem @select="emit('download', entry.targets)">
        <template #icon><Download /></template>
        下载{{ countLabel }}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem tone="danger" @select="emit('remove', entry.targets)">
        <template #icon><Trash2 /></template>
        从媒体库移除{{ countLabel }}
      </ContextMenuItem>
    </template>
  </ContextMenu>
</template>

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

  const batch = computed(() => props.targets.length > 1)
  const countLabel = computed(() => (batch.value ? ` ${props.targets.length} 张` : ''))
</script>

<template>
  <ContextMenu label="图片操作">
    <slot />

    <template v-if="media" #content>
      <ContextMenuItem @select="emit('toggle', media)">
        <template #icon>
          <X v-if="selected" />
          <Check v-else />
        </template>
        {{ selected ? '取消选择' : '选择' }}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem v-if="!batch" @select="emit('open', media)">
        <template #icon><ExternalLink /></template>
        在新标签页打开
      </ContextMenuItem>

      <ContextMenuItem v-if="!batch" @select="emit('copy', media)">
        <template #icon><Link /></template>
        复制图片链接
      </ContextMenuItem>

      <ContextMenuItem @select="emit('download', targets)">
        <template #icon><Download /></template>
        下载{{ countLabel }}
      </ContextMenuItem>

      <ContextMenuSeparator />

      <ContextMenuItem tone="danger" @select="emit('remove', targets)">
        <template #icon><Trash2 /></template>
        从媒体库移除{{ countLabel }}
      </ContextMenuItem>
    </template>
  </ContextMenu>
</template>

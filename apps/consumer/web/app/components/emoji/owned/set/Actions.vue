<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, IconButton, Inline } from '@hina-ui/vue'
  import { Lock, Unlock, Ellipsis, Pencil, Trash2 } from '@lucide/vue'

  defineOptions({ name: 'EmojiOwnedSetActions' })

  const props = defineProps<{
    visibilityPublic: boolean
    togglingVisibility: boolean
    deleting: boolean
  }>()
  const emit = defineEmits<{
    'update:visibilityPublic': [value: boolean]
    'edit-request': []
    'delete-request': []
  }>()
</script>

<template>
  <Inline align="center" gap="sm" :wrap="false" class="shrink-0">
    <IconButton label="编辑贴纸包" tooltip side="top" @click="emit('edit-request')">
      <Pencil />
    </IconButton>

    <DropdownMenu label="贴纸包操作" align="end" class="w-44">
      <IconButton label="更多操作" tooltip side="top" :disabled="deleting">
        <Ellipsis />
      </IconButton>
      <template #content>
        <DropdownMenuItem
          :disabled="togglingVisibility"
          @select="emit('update:visibilityPublic', !props.visibilityPublic)"
        >
          <template #icon>
            <component :is="visibilityPublic ? Lock : Unlock" />
          </template>
          {{ visibilityPublic ? '改为私有' : '公开' }}
        </DropdownMenuItem>
        <DropdownMenuItem tone="danger" :disabled="deleting" @select="emit('delete-request')">
          <template #icon><Trash2 /></template>
          删除贴纸包
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
  </Inline>
</template>

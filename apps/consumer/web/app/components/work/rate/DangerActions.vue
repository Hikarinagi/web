<script setup lang="ts">
  import { AlertDialog, DropdownMenu, DropdownMenuItem, IconButton } from '@hina-ui/vue'
  import { Ellipsis, Eraser, Trash2 } from '@lucide/vue'

  defineOptions({ name: 'WorkRateDangerActions' })

  const props = defineProps<{
    clear: () => Promise<void>
    remove: () => Promise<void>
    disabled?: boolean
  }>()

  const clearOpen = ref(false)
  const removeOpen = ref(false)

  function keepFocus(event: Event) {
    if (clearOpen.value || removeOpen.value) event.preventDefault()
  }
</script>

<template>
  <DropdownMenu label="更多操作" side="top" align="start" @close-auto-focus="keepFocus">
    <IconButton label="更多操作" tooltip variant="ghost" tone="neutral" :disabled="disabled">
      <Ellipsis />
    </IconButton>
    <template #content>
      <DropdownMenuItem @select="clearOpen = true">
        <template #icon><Eraser /></template>
        清除评分
      </DropdownMenuItem>
      <DropdownMenuItem tone="danger" @select="removeOpen = true">
        <template #icon><Trash2 /></template>
        移除状态
      </DropdownMenuItem>
    </template>
  </DropdownMenu>

  <AlertDialog
    v-model:open="clearOpen"
    title="清除评分"
    description="清除后只保留标记，评分与短评会一并移除。"
    confirm-text="清除"
    cancel-text="再想想"
    @confirm="props.clear"
  />
  <AlertDialog
    v-model:open="removeOpen"
    title="移除状态"
    description="移除后，你对这部作品的标记、评分与短评都会删除。"
    tone="danger"
    confirm-text="移除"
    cancel-text="再想想"
    @confirm="props.remove"
  />
</template>

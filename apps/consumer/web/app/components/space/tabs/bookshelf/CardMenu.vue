<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, IconButton, toast } from '@hina-ui/vue'
  import { BookX, EllipsisVertical } from '@lucide/vue'

  defineOptions({ name: 'SpaceTabsBookshelfCardMenu' })

  const props = defineProps<{ kind: 'manga' | 'novel'; workId: number }>()
  const emit = defineEmits<{ removed: [] }>()

  const removing = ref(false)

  async function remove() {
    removing.value = true
    try {
      if (props.kind === 'manga') {
        await hikariRequest<'/api/v3/reader/me/manga/reading/{manga_id}', 'delete'>(
          '/api/v3/reader/me/manga/reading/{manga_id}',
          { method: 'DELETE', path: { manga_id: props.workId } },
        )
      } else {
        await hikariRequest<'/api/v3/reader/me/reading/{light_novel_id}', 'delete'>(
          '/api/v3/reader/me/reading/{light_novel_id}',
          { method: 'DELETE', path: { light_novel_id: props.workId } },
        )
      }
      toast.success('已移出书架。再次阅读时将重新加入。')
      emit('removed')
    } finally {
      removing.value = false
    }
  }
</script>

<template>
  <DropdownMenu label="更多操作" align="end" class="w-40">
    <IconButton label="更多操作" size="sm" variant="ghost" tone="neutral" :loading="removing">
      <EllipsisVertical />
    </IconButton>
    <template #content>
      <DropdownMenuItem @select="remove">
        <template #icon><BookX /></template>
        移出书架
      </DropdownMenuItem>
    </template>
  </DropdownMenu>
</template>

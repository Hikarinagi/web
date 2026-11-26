<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton } from '@hina-ui/vue'
  import { Ellipsis } from '@lucide/vue'

  defineOptions({ name: 'WikiGameReleaseMenu' })

  defineProps<{ release: number; deleted: boolean; deletable: boolean }>()
  const emit = defineEmits<{ erase: [on: boolean]; drop: [] }>()
</script>

<template>
  <DropdownMenu align="end">
    <IconButton label="更多操作" variant="ghost" tone="neutral" size="sm">
      <Ellipsis />
    </IconButton>
    <template #content>
      <DropdownMenuItem :disabled="release < 0" @select="navigateTo(`/entries/${release}/edit`)">
        编辑全部资料
      </DropdownMenuItem>
      <DropdownMenuItem :disabled="release < 0" @select="navigateTo(`/entries/${release}/merge`)">
        与重复的条目合并
      </DropdownMenuItem>
      <DropdownMenuSeparator v-if="release < 0 || deletable" />
      <DropdownMenuItem v-if="release < 0" @select="emit('drop')">取消新建</DropdownMenuItem>
      <template v-else-if="deletable">
        <DropdownMenuItem v-if="deleted" @select="emit('erase', false)">撤销删除</DropdownMenuItem>
        <DropdownMenuItem v-else tone="danger" @select="emit('erase', true)">删除</DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>

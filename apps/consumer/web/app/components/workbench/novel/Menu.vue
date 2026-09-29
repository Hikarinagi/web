<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton } from '@hina-ui/vue'
  import { Archive, BookOpen, Ellipsis, FileUp, Pencil, ScrollText, Users } from '@lucide/vue'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{ project: WorkbenchProjectPageData['project'] }>()
  const emit = defineEmits<{ select: [action: string] }>()

  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const manage = computed(() => props.project.viewer_capabilities.includes('manage'))
  const owner = computed(() => props.project.viewer_role === 'OWNER')
</script>

<template>
  <DropdownMenu label="更多" align="end">
    <IconButton label="更多" size="sm" variant="ghost" tone="neutral">
      <Ellipsis />
    </IconButton>
    <template #content>
      <DropdownMenuItem @select="emit('select', 'volume-info')">
        <template #icon><Pencil /></template>
        编辑分卷信息
      </DropdownMenuItem>
      <DropdownMenuItem @select="emit('select', 'series-info')">
        <template #icon><Pencil /></template>
        编辑作品信息
      </DropdownMenuItem>
      <DropdownMenuItem v-if="project.viewer_role" @select="emit('select', 'collaborators')">
        <template #icon><Users /></template>
        协作者
      </DropdownMenuItem>
      <DropdownMenuItem v-if="project.viewer_role" @select="emit('select', 'credits')">
        <template #icon><ScrollText /></template>
        制作信息
      </DropdownMenuItem>
      <DropdownMenuItem v-if="manage && editable" @select="emit('select', 'import')">
        <template #icon><FileUp /></template>
        重新导入
      </DropdownMenuItem>
      <DropdownMenuItem v-if="project.status === 'PUBLISHED'" @select="emit('select', 'view')">
        <template #icon><BookOpen /></template>
        在分卷页查看
      </DropdownMenuItem>
      <template v-if="owner && editable">
        <DropdownMenuSeparator />
        <DropdownMenuItem tone="danger" @select="emit('select', 'archive')">
          <template #icon><Archive /></template>
          归档
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>

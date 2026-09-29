<script setup lang="ts">
  import { DropdownMenu, DropdownMenuItem, DropdownMenuSeparator, IconButton } from '@hina-ui/vue'
  import {
    Archive,
    BookOpen,
    Ellipsis,
    FileDown,
    FileUp,
    ImageUp,
    Pencil,
    Users,
  } from '@lucide/vue'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  const props = defineProps<{ project: WorkbenchMangaProjectPageData['project'] }>()
  const emit = defineEmits<{ select: [action: string] }>()

  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const can = (capability: string) =>
    (props.project.viewer_capabilities as readonly string[]).includes(capability)
  const owner = computed(() => props.project.viewer_role === 'OWNER')
  const translation = computed(() => props.project.mode === 'TRANSLATION')
</script>

<template>
  <DropdownMenu label="更多" align="end">
    <IconButton label="更多" size="sm" variant="ghost" tone="neutral">
      <Ellipsis />
    </IconButton>
    <template #content>
      <DropdownMenuItem v-if="editable && can('manage')" @select="emit('select', 'upload')">
        <template #icon><ImageUp /></template>
        上传页面
      </DropdownMenuItem>
      <DropdownMenuItem v-if="editable && can('manage')" @select="emit('select', 'chapter-info')">
        <template #icon><Pencil /></template>
        编辑话信息
      </DropdownMenuItem>
      <DropdownMenuItem @select="emit('select', 'series-info')">
        <template #icon><Pencil /></template>
        编辑漫画信息
      </DropdownMenuItem>
      <DropdownMenuItem v-if="project.viewer_role" @select="emit('select', 'collaborators')">
        <template #icon><Users /></template>
        协作者
      </DropdownMenuItem>
      <template v-if="translation">
        <DropdownMenuSeparator />
        <DropdownMenuItem
          v-if="editable && can('label')"
          @select="emit('select', 'labelplus-import')"
        >
          <template #icon><FileUp /></template>
          导入 LabelPlus 翻译稿
        </DropdownMenuItem>
        <DropdownMenuItem @select="emit('select', 'labelplus-source')">
          <template #icon><FileDown /></template>
          导出原文稿
        </DropdownMenuItem>
        <DropdownMenuItem @select="emit('select', 'labelplus-translation')">
          <template #icon><FileDown /></template>
          导出译文稿
        </DropdownMenuItem>
      </template>
      <DropdownMenuItem v-if="project.status === 'PUBLISHED'" @select="emit('select', 'view')">
        <template #icon><BookOpen /></template>
        在漫画页查看
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

<script setup lang="ts">
  import {
    Button,
    DisclosureIcon,
    DropdownMenu,
    DropdownMenuItem,
    Inline,
    Tag,
    toast,
  } from '@hina-ui/vue'
  import { ImageUp, Stamp } from '@lucide/vue'
  import { MANGA_TASK_LABEL, MANGA_TASK_STATUS_META } from '~/features/workbench/manga/labels'
  import type {
    BackendMangaPage,
    BackendMangaProject,
    BackendMangaTask,
  } from '~/features/workbench/manga/manga'
  import { uploadRendered, type TypesetRegion } from '~/features/workbench/manga/render'

  const props = defineProps<{
    project: BackendMangaProject
    page: BackendMangaPage
    tasks: BackendMangaTask[]
    typeset: TypesetRegion[]
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const exporting = ref(false)
  const imageKind = ref<'cleaned' | 'rendered' | null>(null)
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    props.project.viewer_capabilities.includes(capability)
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const latest = computed(() => {
    const seen = new Map<string, BackendMangaTask>()
    for (const task of props.tasks) {
      if (task.page_id === props.page.id && !seen.has(task.kind)) seen.set(task.kind, task)
    }
    return [...seen.values()].filter(task => task.status !== 'DONE' && task.status !== 'CANCELLED')
  })

  async function exportRendered() {
    if (exporting.value) return
    exporting.value = true
    try {
      await uploadRendered(props.page, props.typeset)
      toast.success('该页面的成品图已生成')
      emit('changed')
    } catch (error) {
      if (error instanceof DOMException) toast.danger('无法读取页面图片。成品图未生成。')
      else throw error
    } finally {
      exporting.value = false
    }
  }
</script>

<template>
  <Inline gap="xs" align="center">
    <Tag
      v-for="task in latest"
      :key="task.id"
      size="sm"
      :tone="MANGA_TASK_STATUS_META[task.status]?.tone ?? 'neutral'"
      variant="soft"
    >
      {{ MANGA_TASK_LABEL[task.kind] }}：{{ MANGA_TASK_STATUS_META[task.status]?.label }}
    </Tag>
    <WorkbenchMangaPageTaskMenu
      :project="project"
      :page-ids="[page.id]"
      @queued="emit('changed')"
    />
    <DropdownMenu v-if="editable && (can('redraw') || can('typeset'))" label="图片" align="end">
      <Button size="sm" variant="outline" tone="neutral">
        <template #icon><ImageUp /></template>
        图片
        <template #trailing><DisclosureIcon /></template>
      </Button>
      <template #content>
        <DropdownMenuItem v-if="can('redraw')" @select="imageKind = 'cleaned'">
          上传清理图
        </DropdownMenuItem>
        <DropdownMenuItem v-if="can('typeset')" @select="imageKind = 'rendered'">
          上传成品
        </DropdownMenuItem>
      </template>
    </DropdownMenu>
    <Button
      v-if="editable && can('typeset') && project.mode === 'TRANSLATION'"
      size="sm"
      variant="soft"
      :loading="exporting"
      @click="exportRendered"
    >
      <template #icon><Stamp /></template>
      生成嵌字成品
    </Button>
  </Inline>

  <WorkbenchMangaCanvasImageDialog
    :page="page"
    :kind="imageKind"
    @close="imageKind = null"
    @changed="emit('changed')"
  />
</template>

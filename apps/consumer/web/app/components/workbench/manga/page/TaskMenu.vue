<script setup lang="ts">
  import {
    Button,
    DisclosureIcon,
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
    toast,
  } from '@hina-ui/vue'
  import {
    Eraser,
    Languages,
    ScanText,
    Sparkles,
    SquareDashedMousePointer,
    Stamp,
    Wand2,
  } from '@lucide/vue'
  import { MANGA_TASK_LABEL } from '~/features/workbench/manga/labels'
  import type { BackendMangaPage, BackendMangaProject } from '~/features/workbench/manga/manga'
  import { typesetRegions, uploadRendered } from '~/features/workbench/manga/render'

  const props = defineProps<{
    project: BackendMangaProject
    pageIds?: number[]
    pages?: BackendMangaPage[]
  }>()
  const emit = defineEmits<{ queued: [] }>()

  const busy = ref(false)
  const progress = ref<{ done: number; total: number } | null>(null)
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    props.project.viewer_capabilities.includes(capability)
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const scope = computed(() => (props.pageIds ? '（本页）' : '（所有页面）'))
  const items = computed(() =>
    [
      { kind: 'DETECT' as const, icon: SquareDashedMousePointer, show: can('label') },
      { kind: 'OCR' as const, icon: ScanText, show: can('label') },
      { kind: 'TRANSLATE' as const, icon: Languages, show: can('translate') && translation.value },
      { kind: 'INPAINT' as const, icon: Eraser, show: can('redraw') },
    ].filter(item => item.show),
  )
  const renderable = computed(() =>
    (props.pages ?? []).filter(
      page => !page.rendered_url && (!page.region_count || page.done_count === page.region_count),
    ),
  )

  async function run(kind: 'DETECT' | 'OCR' | 'TRANSLATE' | 'INPAINT', follow = false) {
    if (busy.value) return
    busy.value = true
    try {
      await hikariRequest('/api/v3/manga-projects/{project_id}/tasks', {
        method: 'post',
        path: { project_id: props.project.id },
        body: { kind, page_ids: props.pageIds, follow },
      })
      toast.success(
        follow
          ? '任务已添加到处理队列：全部自动处理'
          : `任务已添加到处理队列：${MANGA_TASK_LABEL[kind]}`,
      )
      emit('queued')
    } finally {
      busy.value = false
    }
  }

  async function renderAll() {
    if (busy.value || !renderable.value.length) return
    busy.value = true
    const targets = renderable.value
    progress.value = { done: 0, total: targets.length }
    let failed = 0
    try {
      for (const page of targets) {
        const regions = await hikariRequest('/api/v3/manga-project-pages/{page_id}/regions', {
          path: { page_id: page.id },
          toast: false,
        })
        try {
          await uploadRendered(page, typesetRegions(regions, props.project.mode))
        } catch (error) {
          if (!(error instanceof DOMException)) throw error
          failed++
        }
        progress.value.done++
      }
      toast.success(`已生成 ${targets.length - failed} 页的成品图。`)
      if (failed) toast.danger(`无法读取 ${failed} 页的图片。这些页面的成品图没有生成。`)
      emit('queued')
    } finally {
      busy.value = false
      progress.value = null
    }
  }
</script>

<template>
  <DropdownMenu v-if="editable && items.length" label="自动处理" align="end">
    <Button size="sm" variant="soft" :loading="busy">
      <template #icon><Wand2 /></template>
      {{
        progress
          ? `正在生成 ${progress.done} / ${progress.total}`
          : pageIds
            ? '自动处理此页面'
            : '自动处理'
      }}
      <template #trailing><DisclosureIcon /></template>
    </Button>
    <template #content>
      <template v-if="translation && can('label')">
        <DropdownMenuItem @select="run('DETECT', true)">
          <template #icon><Sparkles /></template>
          全部自动处理{{ scope }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
      </template>
      <DropdownMenuItem v-for="item in items" :key="item.kind" @select="run(item.kind)">
        <template #icon><component :is="item.icon" /></template>
        {{ MANGA_TASK_LABEL[item.kind] }}{{ scope }}
      </DropdownMenuItem>
      <template v-if="pages && translation && can('typeset')">
        <DropdownMenuSeparator />
        <DropdownMenuItem :disabled="!renderable.length" @select="renderAll">
          <template #icon><Stamp /></template>
          生成成品图（所有页面）
        </DropdownMenuItem>
      </template>
    </template>
  </DropdownMenu>
</template>

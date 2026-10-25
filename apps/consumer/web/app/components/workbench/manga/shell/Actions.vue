<script setup lang="ts">
  import { Inline } from '@hina-ui/vue'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import { MANGA_GUIDE } from '~/features/workbench/manga/guide'
  import type {
    BackendMangaPage,
    BackendMangaProject,
    BackendMangaTask,
  } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    project: BackendMangaProject
    pages: BackendMangaPage[]
    tasks: BackendMangaTask[]
  }>()
  const emit = defineEmits<{ changed: []; manage: [action: string] }>()

  const { uploading } = useMangaEditor().upload
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const blocker = computed(() => {
    if (uploading.value) return '上传完成后可提交'
    if (!props.pages.length) return '还没有页面'
    if (props.tasks.some(task => task.status === 'PENDING' || task.status === 'RUNNING')) {
      return '页面任务完成后可提交'
    }
    const project = props.project
    if (!project.chapter) {
      if (project.scope === 'VOLUME' && project.volume_id === null) return '请先选择单行本'
      if (project.scope === 'CHAPTER' && project.chapter_type === 'SERIALIZATION') {
        if (!project.chapter_number) return '请先填写话数'
      } else if (project.scope === 'CHAPTER' && !project.chapter_name) {
        return '请先填写标题'
      }
    }
    const missing = props.pages.filter(page => !page.rendered_url).length
    return translation.value && missing > 0 ? `${missing} 页仍然没有成品图` : ''
  })
</script>

<template>
  <Inline gap="xs" align="center" :wrap="false" class="shrink-0">
    <Question title="使用说明" size="lg" aria-label="查看使用说明">
      <WorkbenchGuide :sections="MANGA_GUIDE[project.mode]" />
    </Question>
    <WorkbenchMangaPageTaskMenu
      v-if="translation && pages.length"
      :project="project"
      :pages="pages"
      class="max-md:hidden"
      @queued="emit('changed')"
    />
    <WorkbenchSubmitActions
      kind="manga"
      :project="project"
      :blocker="blocker"
      @changed="emit('changed')"
    />
    <WorkbenchMangaShellMenu :project="project" @select="emit('manage', $event)" />
  </Inline>
</template>

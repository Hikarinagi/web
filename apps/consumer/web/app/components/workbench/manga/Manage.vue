<script setup lang="ts">
  import { toast } from '@hina-ui/vue'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'

  const props = defineProps<{
    project: BackendMangaProject
    chapter: WorkbenchMangaProjectPageData['chapter']
  }>()
  const emit = defineEmits<{ refresh: []; regions: [] }>()

  const { confirm } = useHikariConfirm()
  const membersOpen = ref(false)
  const infoOpen = ref(false)
  const importOpen = ref(false)
  const uploadOpen = ref(false)
  const bookTarget = ref<{ slug: 'manga'; id: number } | null>(null)

  async function exportLabelPlus(content: 'source' | 'translation') {
    const file = await hikariRequest('/api/v3/manga-projects/{project_id}/labelplus', {
      path: { project_id: props.project.id },
      query: { content },
    })
    const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = file.filename
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
  }

  async function archive() {
    await hikariRequest('/api/v3/manga-projects/{project_id}/archive', {
      method: 'post',
      path: { project_id: props.project.id },
    })
    toast.success('已归档')
    emit('refresh')
  }

  function open(action: string) {
    if (action === 'upload') uploadOpen.value = true
    else if (action === 'chapter-info') infoOpen.value = true
    else if (action === 'series-info')
      bookTarget.value = { slug: 'manga', id: props.project.series.id }
    else if (action === 'collaborators') membersOpen.value = true
    else if (action === 'labelplus-import') importOpen.value = true
    else if (action === 'labelplus-source') void exportLabelPlus('source')
    else if (action === 'labelplus-translation') void exportLabelPlus('translation')
    else if (action === 'view') void navigateTo(`/mangas/${props.project.series.id}`)
    else if (action === 'archive') {
      confirm({
        title: '归档',
        description: '归档会停止对此投稿的协作，并允许为同一章节开始新的投稿。你可以稍后恢复它。',
        confirmText: '归档',
        cancelText: '取消',
        tone: 'danger',
        onConfirm: archive,
      })
    }
  }

  defineExpose({ open })
</script>

<template>
  <WorkbenchMemberDialog v-model:open="membersOpen" kind="manga" :project="project" />
  <WorkbenchMangaProjectInfoDialog
    v-model:visible="infoOpen"
    :project="project"
    :chapter="chapter"
    @saved="emit('refresh')"
  />
  <WorkbenchMangaLabelplusImportDialog
    v-model:visible="importOpen"
    :project="project"
    @imported="
      () => {
        emit('refresh')
        emit('regions')
      }
    "
  />
  <WorkbenchMangaPageUploadDialog
    v-model:visible="uploadOpen"
    :project-id="project.id"
    @uploaded="emit('refresh')"
  />
  <WorkbenchProjectBookInfoDrawer :target="bookTarget" @close="bookTarget = null" />
</template>

<script setup lang="ts">
  import { Drawer, toast } from '@hina-ui/vue'
  import type { BackendNovelChapter, NovelImportDraft } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    data: WorkbenchProjectPageData
    chapters: BackendNovelChapter[]
    chapter: BackendNovelChapter | null
  }>()
  const emit = defineEmits<{ refresh: []; progress: []; preview: [draft: NovelImportDraft] }>()

  const { confirm } = useHikariConfirm()
  const project = computed(() => props.data.project)
  const translation = computed(() => project.value.mode === 'TRANSLATION')
  const glossaryOpen = ref(false)
  const aiOpen = ref(false)
  const membersOpen = ref(false)
  const creditsOpen = ref(false)
  const importOpen = ref(false)
  const bookTarget = ref<{ slug: 'light-novel' | 'light-novel-volume'; id: number } | null>(null)

  async function archive() {
    await hikariRequest('/api/v3/novel-projects/{project_id}/archive', {
      method: 'POST',
      path: { project_id: project.value.id },
    })
    toast.success('已归档')
    emit('refresh')
  }

  function open(action: string) {
    if (action === 'glossary') glossaryOpen.value = true
    else if (action === 'ai') aiOpen.value = true
    else if (action === 'volume-info')
      bookTarget.value = { slug: 'light-novel-volume', id: project.value.volume.id }
    else if (action === 'series-info')
      bookTarget.value = { slug: 'light-novel', id: project.value.volume.series.id }
    else if (action === 'collaborators') membersOpen.value = true
    else if (action === 'credits') creditsOpen.value = true
    else if (action === 'import') importOpen.value = true
    else if (action === 'view') void navigateTo(`/light-novel-volumes/${project.value.volume.id}`)
    else if (action === 'archive') {
      confirm({
        title: '归档',
        description: '归档会停止对此投稿的协作，并允许针对同一分卷开始新的投稿。你可以稍后恢复它。',
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
  <template v-if="translation">
    <Drawer
      v-model:open="glossaryOpen"
      title="术语表"
      description="术语表仅适用于此项目。"
      size="lg"
      class="w-240 max-w-full"
    >
      <template #content>
        <WorkbenchGlossaryTable
          :project-id="project.id"
          :terms="data.terms"
          :editable="project.viewer_capabilities.includes('translate')"
          @changed="emit('refresh')"
        />
      </template>
    </Drawer>
    <WorkbenchNovelAiDialog
      v-model:open="aiOpen"
      :chapters="chapters"
      :chapter="chapter"
      :batches="data.pretranslations"
      @changed="emit('progress')"
    />
  </template>
  <WorkbenchMemberDialog v-model:open="membersOpen" kind="novel" :project="project" />
  <WorkbenchNovelCreditsDialog
    v-model:open="creditsOpen"
    :project="project"
    @saved="emit('refresh')"
  />
  <WorkbenchNovelImportDialog
    v-model:visible="importOpen"
    :project="project"
    :has-epub="data.has_epub"
    @preview="emit('preview', $event)"
  />
  <WorkbenchProjectBookInfoDrawer :target="bookTarget" @close="bookTarget = null" />
</template>

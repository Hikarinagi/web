<script setup lang="ts">
  import { Button, Card, Empty, FileUpload, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { NovelImportDraft } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{ project: WorkbenchProjectPageData['project']; hasEpub: boolean }>()
  const emit = defineEmits<{ preview: [draft: NovelImportDraft]; created: [] }>()

  const busy = ref(false)
  const blankOpen = ref(false)
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const intro = computed(
    () =>
      `${translation.value ? 'EPUB 文件按原书的目录分成章节。当项目发布时，译文被写回原书，并保留其所有格式。' : ''}TXT 文件按章节标题分为章节，并按换行符分为段落。选择文件后，会显示章节，以便你可以在导入之前查看它们。`,
  )
  const manage = computed(
    () =>
      props.project.viewer_capabilities.includes('manage') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )

  async function load(file: File | null) {
    if (busy.value) return
    busy.value = true
    try {
      const path = { project_id: props.project.id }
      if (file) {
        const body = new FormData()
        body.append('file', file)
        const preview = await hikariRequest('/api/v3/novel-projects/{project_id}/import/preview', {
          method: 'POST',
          path,
          body,
        })
        emit('preview', { preview, file, name: file.name })
      } else {
        const preview = await hikariRequest(
          '/api/v3/novel-projects/{project_id}/import/current/preview',
          { path },
        )
        emit('preview', { preview, file: null, name: '本网站现有的 EPUB' })
      }
    } finally {
      busy.value = false
    }
  }

  function pick(value: File | File[] | null) {
    const file = Array.isArray(value) ? value[0] : value
    if (file) void load(file)
  }
</script>

<template>
  <Card>
    <Stack v-if="manage" gap="lg" align="center" class="py-10">
      <Stack gap="xs" align="center" class="text-center">
        <Heading :level="3" size="md">{{ translation ? '导入原文' : '导入正文' }}</Heading>
        <Text size="sm" tone="muted" class="max-w-2xl">{{ intro }}</Text>
      </Stack>
      <FileUpload
        :model-value="null"
        :list="false"
        accept=".epub,.txt"
        :loading="busy"
        aria-label="选择 EPUB 或 TXT 文件"
        class="w-full max-w-xl"
        @update:model-value="pick"
      >
        将 EPUB 或 TXT 文件拖至此处，或单击选择文件
      </FileUpload>
      <Inline v-if="!translation" gap="sm" justify="center">
        <Button v-if="hasEpub" variant="soft" :disabled="busy" @click="load(null)">
          导入网站上已有的电子书
        </Button>
        <Button variant="outline" tone="neutral" :disabled="busy" @click="blankOpen = true">
          手动输入
        </Button>
      </Inline>
    </Stack>
    <Empty v-else title="还没有正文" />
    <WorkbenchChapterFormDialog
      v-model:visible="blankOpen"
      :project-id="project.id"
      :chapter="null"
      @saved="emit('created')"
    />
  </Card>
</template>

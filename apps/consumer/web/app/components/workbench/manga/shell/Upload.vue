<script setup lang="ts">
  import {
    Alert,
    Card,
    Empty,
    FileUpload,
    Heading,
    Progress,
    Stack,
    Text,
    toast,
  } from '@hina-ui/vue'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import type { WorkbenchMangaProjectPageData } from '~~/server/api/pages/create/manga/[id].get'

  const props = defineProps<{ project: WorkbenchMangaProjectPageData['project'] }>()
  const emit = defineEmits<{ uploaded: [] }>()

  const { uploading, done, total, failed, stopped, upload } = useMangaEditor().upload
  const manage = computed(
    () =>
      props.project.viewer_capabilities.includes('manage') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )

  async function receive(value: File | File[] | null) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    if (!files.length) return
    const count = await upload(files)
    if (count) {
      toast.success(`已上传 ${count} 页`)
      emit('uploaded')
    }
  }
</script>

<template>
  <Card>
    <Stack v-if="manage" gap="lg" align="center" class="py-10">
      <Stack gap="xs" align="center" class="text-center">
        <Heading :level="3" size="md">上传页面</Heading>
        <Text size="sm" tone="muted">
          支持 JPG、PNG 和 WEBP 图片以及 ZIP、CBZ 或 EPUB 文件。压缩包中的图片按文件名排序；EPUB
          中的页面按其阅读顺序。
        </Text>
      </Stack>
      <FileUpload
        :model-value="[]"
        multiple
        :list="false"
        accept="image/*,.zip,.cbz,.epub"
        :loading="uploading"
        aria-label="选择图片、压缩包或 EPUB"
        class="w-full max-w-xl"
        @update:model-value="receive"
      >
        将图片、压缩包或 EPUB 拖至此处，或单击以选择文件
      </FileUpload>
      <Stack v-if="uploading" gap="xs" class="w-full max-w-xl">
        <Progress :value="done" :max="Math.max(total, 1)" size="sm" />
        <Text size="xs" tone="muted" class="tabular-nums">
          已上传 {{ done }} 页，共 {{ total }} 页
        </Text>
      </Stack>
      <Alert
        :open="!!stopped"
        tone="danger"
        :closable="false"
        title="上传已停止，已传的页面保留"
        class="w-full max-w-xl"
      >
        <Text size="sm">{{ stopped }}</Text>
      </Alert>
      <Alert
        :open="failed.length > 0"
        tone="danger"
        :closable="false"
        :title="stopped ? '以下图片没有上传' : '以下图片上传失败'"
        class="w-full max-w-xl"
      >
        <Text size="sm">{{ failed.join('、') }}</Text>
      </Alert>
    </Stack>
    <Empty v-else title="还没有页面" />
  </Card>
</template>

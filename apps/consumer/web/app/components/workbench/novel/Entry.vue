<script setup lang="ts">
  import { Alert, Button, Card, Divider, Inline, ScrollArea, Stack, Text } from '@hina-ui/vue'
  import type { ChapterSaveStatus } from '~/features/workbench/composables/useChapterEditor'
  import type {
    BackendNovelChapter,
    BackendNovelProject,
    BackendNovelSegment,
  } from '~/features/workbench/workbench'

  const props = defineProps<{
    project: BackendNovelProject
    chapter: BackendNovelChapter
    segments: BackendNovelSegment[]
  }>()

  const STATUS_LABEL: Record<ChapterSaveStatus, string> = {
    saved: '已保存',
    dirty: '有未保存的修改',
    saving: '正在保存…',
    conflict: '内容冲突。请重新加载。',
    error: '保存失败',
  }

  const editable =
    props.project.viewer_capabilities.includes('write') &&
    ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status)

  const {
    editor,
    pluginContext,
    plugins,
    status,
    remoteChanged,
    chars,
    save,
    reload,
    applyChange,
  } = useChapterEditor({ chapterId: props.chapter.id, segments: props.segments, editable })

  defineExpose({ applyChange })
</script>

<template>
  <Stack gap="none" class="h-full bg-canvas">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line bg-surface px-5"
    >
      <Text weight="semibold" truncate>{{ chapter.title }}</Text>
      <Inline gap="md" align="center" justify="end" :wrap="false" class="min-w-0 flex-1">
        <Text size="xs" tone="muted" class="tabular-nums">{{ chars }} 字</Text>
        <Text size="xs" :tone="status === 'conflict' || status === 'error' ? 'danger' : 'muted'">
          {{ editable ? STATUS_LABEL[status] : '只读' }}
        </Text>
        <Button
          v-if="editable"
          size="sm"
          variant="soft"
          :disabled="status !== 'dirty' && status !== 'error'"
          @click="save"
        >
          立即保存
        </Button>
      </Inline>
    </Inline>
    <Alert
      :open="remoteChanged || status === 'conflict'"
      tone="warning"
      :closable="false"
      title="另一位成员更改了本章"
      class="m-4 mb-0"
    >
      重新加载将放弃你未保存的更改。
      <template #actions>
        <Button size="sm" variant="soft" @click="reload">重新载入</Button>
      </template>
    </Alert>
    <ScrollArea class="min-h-0 flex-1">
      <Card :padded="false" class="mx-auto my-6 max-w-3xl">
        <HikariEditorToolbar
          v-if="editable"
          :editor="editor"
          :items="plugins"
          :context="pluginContext"
          class="sticky top-0 z-1 rounded-t-lg bg-surface"
        />
        <Divider v-if="editable" />
        <HikariEditor v-if="editor" :editor="editor" class="min-h-screen px-12 py-10" />
      </Card>
    </ScrollArea>
    <HikariEditorOverlayHost :plugins="plugins" />
  </Stack>
</template>

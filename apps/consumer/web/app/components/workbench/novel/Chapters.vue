<script setup lang="ts">
  import {
    DropdownMenu,
    DropdownMenuItem,
    IconButton,
    Inline,
    NavLink,
    ScrollArea,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ArrowDown, ArrowUp, Check, Ellipsis, Pencil, Plus, Trash2 } from '@lucide/vue'
  import type { BackendNovelChapter } from '~/features/workbench/workbench'
  import type { WorkbenchProjectPageData } from '~~/server/api/pages/create/projects/[id].get'

  const props = defineProps<{
    project: WorkbenchProjectPageData['project']
    chapters: BackendNovelChapter[]
    current: number | null
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const { confirm } = useHikariConfirm()
  const formOpen = ref(false)
  const editing = ref<BackendNovelChapter | null>(null)
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const editable = computed(
    () =>
      props.project.mode === 'ENTRY' &&
      props.project.viewer_capabilities.includes('manage') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )

  const percent = (chapter: BackendNovelChapter) =>
    chapter.segment_count ? Math.floor((chapter.done_count * 100) / chapter.segment_count) : 0

  function openForm(chapter: BackendNovelChapter | null) {
    editing.value = chapter
    formOpen.value = true
  }

  async function move(index: number, offset: -1 | 1) {
    const target = props.chapters[index + offset]
    const chapter = props.chapters[index]
    if (!target || !chapter) return
    const beyond = props.chapters[index + offset * 2]
    const sortKey = beyond
      ? (target.sort_key + beyond.sort_key) / 2
      : target.sort_key + offset * 1024
    await hikariRequest('/api/v3/novel-chapters/{chapter_id}', {
      method: 'PATCH',
      path: { chapter_id: chapter.id },
      body: { sort_key: sortKey },
    })
    emit('changed')
  }

  function remove(chapter: BackendNovelChapter) {
    confirm({
      title: '删除章节',
      description: `「${chapter.title}」及其 ${chapter.segment_count} 个段落、译文和批注将被删除。此操作无法撤消。`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/novel-chapters/{chapter_id}', {
          method: 'delete',
          path: { chapter_id: chapter.id },
        })
        emit('changed')
      },
    })
  }
</script>

<template>
  <Stack as="nav" gap="none" aria-label="章节" class="h-full bg-surface">
    <Inline
      align="center"
      justify="between"
      gap="sm"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line pr-2 pl-4"
    >
      <Text size="sm" weight="semibold">章节 · {{ chapters.length }}</Text>
      <IconButton
        v-if="editable"
        label="新增章节"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="openForm(null)"
      >
        <Plus />
      </IconButton>
    </Inline>
    <ScrollArea class="min-h-0 flex-1">
      <Stack gap="none" class="p-2">
        <Inline
          v-for="(chapter, index) in chapters"
          :key="chapter.id"
          gap="none"
          align="center"
          :wrap="false"
          class="group"
        >
          <NavLink
            :as="NuxtLink"
            :to="{ query: { chapter: chapter.id } }"
            :active="chapter.id === current"
            class="min-w-0 flex-1 [&>[data-hn-label]]:min-w-0 [&>[data-hn-label]]:shrink"
          >
            <Inline gap="sm" align="center" justify="between" :wrap="false" class="w-full">
              <Text as="span" size="sm" truncate class="min-w-0">{{ chapter.title }}</Text>
              <template v-if="translation">
                <Check
                  v-if="chapter.segment_count && chapter.done_count === chapter.segment_count"
                  class="size-4 shrink-0 text-success-text"
                  aria-label="已完成"
                />
                <Text v-else as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
                  {{ percent(chapter) }}%
                </Text>
              </template>
              <Text v-else as="span" size="xs" tone="muted" class="shrink-0 tabular-nums">
                {{ chapter.segment_count }} 段
              </Text>
            </Inline>
          </NavLink>
          <DropdownMenu v-if="editable" label="章节操作" align="end">
            <IconButton
              label="章节操作"
              size="sm"
              variant="ghost"
              tone="neutral"
              class="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
            >
              <Ellipsis />
            </IconButton>
            <template #content>
              <DropdownMenuItem @select="openForm(chapter)">
                <template #icon><Pencil /></template>
                修改章节
              </DropdownMenuItem>
              <DropdownMenuItem :disabled="index === 0" @select="move(index, -1)">
                <template #icon><ArrowUp /></template>
                上移
              </DropdownMenuItem>
              <DropdownMenuItem :disabled="index === chapters.length - 1" @select="move(index, 1)">
                <template #icon><ArrowDown /></template>
                下移
              </DropdownMenuItem>
              <DropdownMenuItem tone="danger" @select="remove(chapter)">
                <template #icon><Trash2 /></template>
                删除章节
              </DropdownMenuItem>
            </template>
          </DropdownMenu>
        </Inline>
      </Stack>
    </ScrollArea>
    <WorkbenchChapterFormDialog
      v-model:visible="formOpen"
      :project-id="project.id"
      :chapter="editing"
      :translation="translation"
      @saved="emit('changed')"
    />
  </Stack>
</template>

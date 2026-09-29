<script setup lang="ts">
  import {
    Card,
    DropdownMenu,
    DropdownMenuItem,
    IconButton,
    Inline,
    Progress,
    Ripple,
    ScrollArea,
    Spinner,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ArrowDown, ArrowUp, EllipsisVertical, ImagePlus, Trash2 } from '@lucide/vue'
  import type {
    BackendMangaPage,
    BackendMangaProject,
    BackendMangaTask,
  } from '~/features/workbench/manga/manga'
  import { cn } from '~/utils/cn'

  const props = defineProps<{
    project: BackendMangaProject
    pages: BackendMangaPage[]
    tasks: BackendMangaTask[]
    current: number | null
    counts: Map<number, { total: number; done: number }>
  }>()
  const emit = defineEmits<{ select: [id: number]; changed: []; upload: [] }>()

  const { confirm } = useHikariConfirm()
  const manage = computed(
    () =>
      props.project.viewer_capabilities.includes('manage') &&
      ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )
  const translation = computed(() => props.project.mode === 'TRANSLATION')
  const busy = computed(
    () =>
      new Set(
        props.tasks
          .filter(task => task.status === 'PENDING' || task.status === 'RUNNING')
          .map(task => task.page_id),
      ),
  )
  const thumbnail = (page: BackendMangaPage) =>
    page.rendered_url ?? page.cleaned_url ?? page.original_url
  const progressOf = (page: BackendMangaPage) => {
    const count = props.counts.get(page.id) ?? { total: 0, done: 0 }
    if (page.rendered_url) return { value: 1, max: 1, text: '已嵌字' }
    if (!count.total) return { value: 0, max: 1, text: '还没有文本框' }
    return {
      value: count.done,
      max: count.total,
      text: `已翻译 ${count.done} / ${count.total} 个文本框`,
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const ids = props.pages.map(page => page.id)
    const [moved] = ids.splice(index, 1)
    if (moved === undefined) return
    ids.splice(index + direction, 0, moved)
    await hikariRequest('/api/v3/manga-projects/{project_id}/pages/order', {
      method: 'put',
      path: { project_id: props.project.id },
      body: { page_ids: ids },
    })
    emit('changed')
  }

  function remove(page: BackendMangaPage, index: number) {
    confirm({
      title: '删除页面',
      description: `你确定要删除第 ${index + 1} 页吗？此页面上的文本框和译文也将被删除。`,
      confirmText: '删除',
      cancelText: '取消',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/manga-project-pages/{page_id}', {
          method: 'delete',
          path: { page_id: page.id },
        })
        emit('changed')
      },
    })
  }
</script>

<template>
  <Stack as="nav" gap="none" aria-label="页面" class="h-full bg-surface">
    <Inline
      align="center"
      justify="between"
      gap="sm"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line pr-2 pl-4"
    >
      <Text size="sm" weight="semibold">页面 · {{ pages.length }}</Text>
      <IconButton
        v-if="manage"
        label="上传页面"
        size="sm"
        variant="ghost"
        tone="neutral"
        @click="emit('upload')"
      >
        <ImagePlus />
      </IconButton>
    </Inline>
    <ScrollArea class="min-h-0 flex-1">
      <Stack gap="md" class="p-3">
        <Stack v-for="(page, index) in pages" :key="page.id" gap="xs" class="group">
          <Card
            as="button"
            type="button"
            :aria-current="page.id === current ? 'page' : undefined"
            :aria-label="`第 ${index + 1} 页`"
            :padded="false"
            :class="
              cn(
                'hn-state-layer relative hn-interactive overflow-hidden hn-press-lg',
                page.id === current && 'ring-2 ring-accent',
              )
            "
            @click="emit('select', page.id)"
          >
            <Ripple />
            <HikariImage
              :src="thumbnail(page)"
              :processing="false"
              alt=""
              class="aspect-3/4 w-full"
              image-class="object-cover object-top"
            />
            <Spinner
              v-if="busy.has(page.id)"
              size="sm"
              class="absolute top-1.5 left-1.5 rounded-full bg-surface p-0.5"
            />
          </Card>
          <Inline gap="xs" align="center" :wrap="false">
            <Text size="xs" class="w-5 shrink-0 tabular-nums">{{ index + 1 }}</Text>
            <Progress
              v-if="translation"
              v-tooltip="progressOf(page).text"
              :value="progressOf(page).value"
              :max="progressOf(page).max"
              :tone="page.rendered_url ? 'success' : 'accent'"
              :aria-label="progressOf(page).text"
              size="sm"
              class="min-w-0 flex-1"
            />
            <DropdownMenu v-if="manage" label="页面操作" align="end">
              <IconButton
                label="页面操作"
                variant="ghost"
                tone="neutral"
                size="sm"
                class="ml-auto opacity-0 group-hover:opacity-100 focus-visible:opacity-100 data-[state=open]:opacity-100 pointer-coarse:opacity-100"
              >
                <EllipsisVertical />
              </IconButton>
              <template #content>
                <DropdownMenuItem :disabled="index === 0" @select="move(index, -1)">
                  <template #icon><ArrowUp /></template>
                  前移一页
                </DropdownMenuItem>
                <DropdownMenuItem :disabled="index === pages.length - 1" @select="move(index, 1)">
                  <template #icon><ArrowDown /></template>
                  后移一页
                </DropdownMenuItem>
                <DropdownMenuItem tone="danger" @select="remove(page, index)">
                  <template #icon><Trash2 /></template>
                  删除这一页
                </DropdownMenuItem>
              </template>
            </DropdownMenu>
          </Inline>
        </Stack>
      </Stack>
    </ScrollArea>
  </Stack>
</template>

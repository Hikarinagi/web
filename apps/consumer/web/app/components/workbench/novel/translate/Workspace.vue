<script setup lang="ts">
  import {
    Button,
    Drawer,
    IconButton,
    Inline,
    Kbd,
    SegmentedControl,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Spinner,
    Stack,
    Text,
    VirtualList,
    type VirtualListExpose,
  } from '@hina-ui/vue'
  import { BookOpenText, Check } from '@lucide/vue'
  import { useMediaQuery } from '@vueuse/core'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { useTranslationEditor } from '~/features/workbench/composables/useTranslationEditor'
  import type {
    BackendNovelChapter,
    BackendNovelProject,
    BackendNovelSegment,
    BackendNovelTerm,
  } from '~/features/workbench/workbench'

  const props = defineProps<{
    project: BackendNovelProject
    chapter: BackendNovelChapter
    segments: BackendNovelSegment[]
    terms: BackendNovelTerm[]
    focus?: string | null
    editing?: Map<string, components['schemas']['UserRefDto'][]>
  }>()
  const emit = defineEmits<{ position: [segmentId: string | null] }>()

  const editor = useTranslationEditor(() => props.chapter.id, props.segments)
  const { visible, texts, numbers, done, activeId, active, filter, states, failed, saving } = editor
  watch(activeId, id => emit('position', id))
  onBeforeUnmount(() => emit('position', null))
  const list = useTemplateRef<VirtualListExpose>('list')
  const wide = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1440 })
  const contextOpen = ref(false)

  const readonly = computed(
    () =>
      !props.project.viewer_capabilities.includes('translate') ||
      !['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status),
  )
  const filters = computed(() => {
    const count = (test: (segment: BackendNovelSegment) => boolean) =>
      texts.value.filter(test).length
    return [
      { value: 'all', label: '全部' },
      { value: 'empty', label: `未翻译 ${count(segment => segment.state === 0)}` },
      {
        value: 'machine',
        label: `未经修改的 AI 翻译 ${count(segment => !!editor.chosen(segment)?.machine)}`,
      },
      { value: 'revise', label: `需修改 ${count(segment => segment.state === 10)}` },
    ]
  })
  const machineOf = (segment: BackendNovelSegment) =>
    !editor.drafts.has(segment.id) && !!editor.chosen(segment)?.machine

  function focusSegment(id: string) {
    const index = visible.value.findIndex(segment => segment.id === id)
    if (index < 0) return
    activeId.value = id
    list.value?.scrollToIndex(index, { align: 'auto' })
    requestAnimationFrame(() => {
      list.value?.viewport
        ?.querySelector<HTMLTextAreaElement>(`[data-segment-input="${id}"]`)
        ?.focus()
    })
  }

  function move(from: BackendNovelSegment, target: 'next' | 'prev' | 'empty') {
    void editor.save(from.id)
    const rows = visible.value.filter(segment => segment.kind === 'TEXT')
    const index = rows.findIndex(segment => segment.id === from.id)
    const next =
      target === 'prev'
        ? rows[index - 1]
        : target === 'next'
          ? rows[index + 1]
          : rows.slice(index + 1).find(segment => segment.state === 0)
    if (next) focusSegment(next.id)
  }

  function retry() {
    for (const id of failed.value) void editor.save(id)
  }

  function useText(text: string) {
    if (!active.value) return
    editor.edit(active.value.id, text)
    void editor.save(active.value.id)
  }

  onMounted(() => {
    if (props.focus) focusSegment(props.focus)
  })

  defineExpose({ applyChange: editor.applyChange, focusSegment })
</script>

<template>
  <Splitter
    :key="String(wide)"
    :auto-save-id="wide ? 'workbench-novel-translate' : 'workbench-novel-translate-narrow'"
    class="h-full"
  >
    <SplitterPanel :default-size="wide ? 72 : 100" :min-size="50">
      <Stack gap="none" class="h-full bg-surface">
        <Inline
          gap="md"
          align="center"
          class="min-h-11 shrink-0 gap-y-1.5 border-b border-line px-5 py-1.5"
        >
          <Text weight="semibold" truncate class="min-w-32 flex-1">{{ chapter.title }}</Text>
          <Text size="xs" tone="muted" class="shrink-0 tabular-nums">
            已翻译 {{ done }} / {{ texts.length }} 段
          </Text>
          <Inline gap="xs" align="center" :wrap="false" class="shrink-0">
            <SegmentedControl v-model="filter" :options="filters" size="sm" aria-label="段落筛选" />
            <IconButton
              v-if="!wide"
              label="参考资料"
              size="sm"
              variant="ghost"
              tone="neutral"
              @click="contextOpen = true"
            >
              <BookOpenText />
            </IconButton>
          </Inline>
        </Inline>
        <Inline
          gap="lg"
          :wrap="false"
          class="shrink-0 border-b border-line bg-subtle px-5 py-2 max-lg:hidden"
        >
          <Inline class="w-6 shrink-0" aria-hidden="true" />
          <Text size="xs" tone="muted" class="flex-1">原文</Text>
          <Text size="xs" tone="muted" class="flex-1">译文</Text>
        </Inline>
        <VirtualList
          ref="list"
          :items="visible"
          :get-key="segment => segment.id"
          :estimate-size="96"
          height="100%"
          label="段落"
          empty-text="没有匹配的段落"
          class="min-h-0 flex-1"
        >
          <template #default="{ item }">
            <WorkbenchNovelTranslateRow
              :segment="item"
              :number="(numbers.get(item.id) ?? -1) + 1"
              :text="editor.textOf(item)"
              :machine="machineOf(item)"
              :save="states.get(item.id)"
              :issues="editor.issues.get(item.id)"
              :terms="terms"
              :readonly="readonly"
              :active="activeId === item.id"
              :editors="editing?.get(item.id)"
              @update="text => editor.edit(item.id, text)"
              @focus="activeId = item.id"
              @blur="editor.save(item.id)"
              @move="target => move(item, target)"
            />
          </template>
        </VirtualList>
        <Inline
          gap="lg"
          align="center"
          :wrap="false"
          class="h-8 shrink-0 border-t border-line bg-subtle px-5 text-xs text-muted"
        >
          <template v-if="!readonly">
            <Text size="xs" tone="muted" class="max-md:hidden">
              <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> 保存并转到下一段
            </Text>
            <Text size="xs" tone="muted" class="max-lg:hidden">
              <Kbd>Ctrl</Kbd> + <Kbd>Shift</Kbd> + <Kbd>Enter</Kbd> 下一个未翻译的段落
            </Text>
          </template>
          <Inline gap="xs" align="center" justify="end" class="flex-1">
            <template v-if="failed.length">
              <Text size="xs" tone="danger">{{ failed.length }} 个段落保存失败</Text>
              <Button size="sm" variant="ghost" @click="retry">重试</Button>
            </template>
            <template v-else-if="saving">
              <Spinner size="sm" />
              <Text size="xs" tone="muted">正在保存…</Text>
            </template>
            <template v-else-if="!readonly">
              <Check class="size-3.5 text-success" aria-hidden="true" />
              <Text size="xs" tone="muted">已保存所有更改</Text>
            </template>
          </Inline>
        </Inline>
        <Drawer v-if="!wide" v-model:open="contextOpen" title="参考资料" size="md">
          <template #content>
            <WorkbenchNovelTranslateContext
              :project="project"
              :segment="active"
              :number="active ? (numbers.get(active.id) ?? -1) + 1 : null"
              :text="active ? editor.textOf(active) : ''"
              :terms="terms"
              :readonly="readonly"
              @use-text="useText"
              @changed="editor.reload"
            />
          </template>
        </Drawer>
      </Stack>
    </SplitterPanel>
    <template v-if="wide">
      <SplitterHandle label="调整参考资料宽度" />
      <SplitterPanel :default-size="28" :min-size="20" :max-size="40" collapsible>
        <WorkbenchNovelTranslateContext
          :project="project"
          :segment="active"
          :number="active ? (numbers.get(active.id) ?? -1) + 1 : null"
          :text="active ? editor.textOf(active) : ''"
          :terms="terms"
          :readonly="readonly"
          class="border-l border-line bg-surface"
          @use-text="useText"
          @changed="editor.reload"
        />
      </SplitterPanel>
    </template>
  </Splitter>
</template>

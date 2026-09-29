<script setup lang="ts">
  import {
    Empty,
    Inline,
    Kbd,
    ScrollArea,
    SegmentedControl,
    Splitter,
    SplitterHandle,
    SplitterPanel,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import type { components } from '@hikarinagi/api-contract/v3'
  import { useMangaEditor } from '~/features/workbench/manga/composables/editor-context'
  import type { EditableRegion } from '~/features/workbench/manga/composables/useMangaRegions'
  import { boundsOf, type Point } from '~/features/workbench/manga/geometry'
  import type { BackendMangaProject } from '~/features/workbench/manga/manga'
  import { readStyle } from '~/features/workbench/manga/typeset'

  export type SideMode = 'translate' | 'proofread' | 'typeset'

  const props = defineProps<{
    project: BackendMangaProject
    regions: EditableRegion[]
    editing: Map<string, components['schemas']['UserRefDto'][]>
  }>()
  const mode = defineModel<SideMode>('mode', { required: true })
  const emit = defineEmits<{ advance: [direction: 1 | -1] }>()

  const { store } = useMangaEditor()
  const selected = store.selected
  const index = computed(() =>
    props.regions.findIndex(region => region.id === store.selectedId.value),
  )
  const lang = computed(() => props.project.source_lang ?? undefined)
  const editable = computed(() => ['DRAFT', 'ACTIVE', 'PUBLISHED'].includes(props.project.status))
  const can = (capability: BackendMangaProject['viewer_capabilities'][number]) =>
    props.project.viewer_capabilities.includes(capability)
  const modes = computed(() =>
    [
      { value: 'translate', label: '翻译', show: can('translate') },
      { value: 'proofread', label: '校对', show: can('proofread') || can('finalize') },
      { value: 'typeset', label: '嵌字', show: can('typeset') },
    ].filter(item => item.show),
  )
  const style = computed(() => {
    const region = selected.value
    if (!region) return null
    const bounds = boundsOf(region.vertices as Point[], region.x, region.y)
    return readStyle(region.style, bounds.y1 - bounds.y0 > bounds.x1 - bounds.x0)
  })
</script>

<template>
  <Stack gap="none" class="h-full bg-surface">
    <Inline
      gap="sm"
      align="center"
      justify="between"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line px-4"
    >
      <Text size="sm" weight="semibold" class="shrink-0">文本框({{ regions.length }})</Text>
      <SegmentedControl
        v-if="modes.length > 1"
        :model-value="mode"
        :options="modes"
        size="sm"
        aria-label="工作模式"
        @update:model-value="value => (mode = value as SideMode)"
      />
    </Inline>
    <Splitter direction="vertical" auto-save-id="workbench-manga-side" class="min-h-0 flex-1">
      <SplitterPanel :default-size="40" :min-size="20">
        <WorkbenchMangaSideRegions
          :regions="regions"
          :mode="mode"
          :lang="lang"
          :editing="editing"
        />
      </SplitterPanel>
      <SplitterHandle label="调整文本框列表的高度" />
      <SplitterPanel :default-size="60" :min-size="30">
        <ScrollArea v-if="selected && index >= 0" class="h-full border-t border-line">
          <WorkbenchMangaSideStyle
            v-if="mode === 'typeset' && style"
            :region="selected"
            :style="style"
            :editable="editable && can('typeset')"
            class="p-4"
            @update="value => store.update(selected!.id, { style: value })"
          />
          <WorkbenchMangaSideReview
            v-else-if="mode === 'proofread'"
            :project="project"
            :region="selected"
            :index="index"
            :total="regions.length"
            :lang="lang"
          />
          <WorkbenchMangaSideDock
            v-else
            :project="project"
            :region="selected"
            :index="index"
            :total="regions.length"
            :lang="lang"
            @advance="emit('advance', $event)"
          />
        </ScrollArea>
        <Empty
          v-else
          title="选择一个文本框"
          description="单击图像上的文本框或上面列表中的项目。"
          class="h-full border-t border-line"
        />
      </SplitterPanel>
    </Splitter>
    <Inline
      v-if="mode === 'translate'"
      gap="xs"
      align="center"
      class="shrink-0 gap-x-4 border-t border-line bg-subtle px-4 py-1.5"
    >
      <Text size="xs" tone="muted">
        <Kbd>Ctrl</Kbd> + <Kbd>Enter</Kbd> 保存并转到下一个文本框
      </Text>
      <Text size="xs" tone="muted">
        <Kbd>Ctrl</Kbd> + <Kbd>←</Kbd> / <Kbd>→</Kbd> 上一页或下一页
      </Text>
    </Inline>
  </Stack>
</template>

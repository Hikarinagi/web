<script setup lang="ts">
  import {
    Kbd,
    Text,
    Toolbar,
    ToolbarButton,
    ToolbarToggleGroup,
    ToolbarToggleItem,
  } from '@hina-ui/vue'
  import { MessageSquarePlus } from '@lucide/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import type {
    CompareMode,
    ReviewFilter,
    ReviewView,
  } from '~/features/workbench/manga/review/useReviewState'

  const { state, drawing, startNote } = useMangaReview()
  const page = computed(() => state.view.value === 'page')
  const filters = computed(() => [
    { value: 'all', label: '全部', count: state.counts.value.all },
    { value: 'flagged', label: '有标记', count: state.counts.value.flagged },
    { value: 'notes', label: '有批注', count: state.counts.value.notes },
    ...(state.replacement.value
      ? [{ value: 'unmatched', label: '无对应', count: state.counts.value.unmatched }]
      : []),
  ])
  const MODES = [
    { value: 'side', label: '并排', key: '1' },
    { value: 'swipe', label: '滑动', key: '2' },
    { value: 'toggle', label: '切换', key: '3' },
  ]
  const ZOOMS = [
    { value: 'fit', label: '适合高度', key: '0' },
    { value: '1', label: '100%', key: '' },
    { value: '2', label: '200%', key: '' },
  ]
  const zoom = computed({
    get: () => String(state.zoom.value),
    set: value => {
      state.zoom.value = value === 'fit' ? 'fit' : (Number(value) as 1 | 2)
    },
  })

  function setView(value: unknown) {
    if (value === 'page') state.open(state.index.value)
    else if (value) state.view.value = value as ReviewView
  }
</script>

<template>
  <Toolbar
    label="视图"
    size="sm"
    variant="bare"
    class="min-h-12 shrink-0 flex-wrap gap-3 border-b border-line bg-surface px-4 py-2"
  >
    <ToolbarToggleGroup :model-value="state.view.value" label="视图" @update:model-value="setView">
      <ToolbarToggleItem v-tooltip="'快捷键 G'" value="overview">总览</ToolbarToggleItem>
      <ToolbarToggleItem v-tooltip="'快捷键 E'" value="page">逐页</ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarToggleGroup
      v-if="!page"
      :model-value="state.filter.value"
      label="筛选"
      @update:model-value="value => value && (state.filter.value = value as ReviewFilter)"
    >
      <ToolbarToggleItem v-for="item in filters" :key="item.value" :value="item.value">
        {{ item.label }}
        <Text as="span" size="sm" tone="muted" class="tabular-nums">{{ item.count }}</Text>
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
    <ToolbarToggleGroup
      v-if="page && state.replacement.value"
      :model-value="state.mode.value"
      label="对比模式"
      @update:model-value="value => value && (state.mode.value = value as CompareMode)"
    >
      <ToolbarToggleItem
        v-for="item in MODES"
        :key="item.value"
        v-tooltip="`快捷键 ${item.key}`"
        :value="item.value"
        :class="item.value === 'toggle' ? undefined : 'max-lg:hidden'"
      >
        {{ item.label }}
      </ToolbarToggleItem>
    </ToolbarToggleGroup>
    <template v-if="page">
      <ToolbarToggleGroup
        :model-value="zoom"
        label="缩放"
        class="ml-auto"
        @update:model-value="value => value && (zoom = value as string)"
      >
        <ToolbarToggleItem
          v-for="item in ZOOMS"
          :key="item.value"
          v-tooltip="item.key ? `快捷键 ${item.key}` : '快捷键 + 与 -'"
          :value="item.value"
        >
          {{ item.label }}
        </ToolbarToggleItem>
      </ToolbarToggleGroup>
      <ToolbarButton :variant="drawing ? 'soft' : 'ghost'" @click="startNote">
        <template #icon><MessageSquarePlus /></template>
        批注
        <template #trailing><Kbd class="max-lg:hidden">N</Kbd></template>
      </ToolbarButton>
      <Text size="sm" tone="muted" class="whitespace-nowrap tabular-nums max-lg:hidden">
        第 {{ state.index.value + 1 }} / {{ state.rows.value.length }} 页
      </Text>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
  import { Empty, Inline, Kbd, SegmentedControl, Stack, Tag, Text } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageFacts, pageSrc } from '~/features/workbench/manga/review/pages'
  import type { ReviewSide } from '~/features/workbench/manga/review/useReviewState'

  const SIDES = [
    { value: 'baseline', label: '现有版本' },
    { value: 'upload', label: '新上传' },
  ]
  const { state, baseline } = useMangaReview()
  const row = computed(() => state.current.value)
  const shown = computed(() => {
    if (state.showing.value === 'upload') {
      return (
        row.value && {
          label: '新上传',
          position: `第 ${row.value.number} / ${state.rows.value.length} 页`,
          src: pageSrc(row.value.page),
          width: row.value.page.width,
          height: row.value.page.height,
          facts: pageFacts(row.value.page),
          pageId: row.value.page.id as number | undefined,
        }
      )
    }
    const base = state.baselinePage.value
    return (
      base && {
        label: '现有版本',
        position: `第 ${base.page_number} / ${baseline.value.length} 页`,
        src: base.url,
        width: base.width ?? 0,
        height: base.height ?? 0,
        facts: pageFacts(base),
        pageId: undefined,
      }
    )
  })
</script>

<template>
  <Stack gap="none" class="min-h-0">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line bg-surface px-4"
    >
      <SegmentedControl
        :model-value="state.showing.value"
        :options="SIDES"
        size="sm"
        aria-label="当前显示的版本"
        @update:model-value="value => value && (state.showing.value = value as ReviewSide)"
      />
      <Kbd class="max-lg:hidden">Space</Kbd>
      <Text v-if="shown" size="sm" weight="medium" class="ml-auto max-md:hidden">
        {{ shown.label }}
      </Text>
      <Text v-if="shown" size="sm" class="tabular-nums max-md:ml-auto">{{ shown.position }}</Text>
      <Text
        v-for="fact in shown?.facts ?? []"
        :key="fact"
        size="sm"
        tone="muted"
        class="tabular-nums max-md:hidden"
      >
        {{ fact }}
      </Text>
    </Inline>
    <WorkbenchMangaReviewViewport
      v-if="shown"
      :src="shown.src"
      :width="shown.width"
      :height="shown.height"
      :alt="`${shown.label}，${shown.position}`"
      :page-id="shown.pageId"
      class="min-h-0 flex-1"
    >
      <Tag size="sm" variant="soft" tone="neutral" class="absolute top-3 left-3">
        {{ shown.label }}
      </Tag>
    </WorkbenchMangaReviewViewport>
    <Empty
      v-else
      size="sm"
      :icon="false"
      title="现有版本没有对应页"
      class="min-h-0 flex-1 bg-inset"
    />
  </Stack>
</template>

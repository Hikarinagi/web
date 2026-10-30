<script setup lang="ts">
  import { Empty, Inline, Select, Stack, Text } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageFacts, pageSrc } from '~/features/workbench/manga/review/pages'
  import type { ReviewSide } from '~/features/workbench/manga/review/useReviewState'

  const props = defineProps<{ side: ReviewSide }>()

  const { state, baseline } = useMangaReview()
  const row = computed(() => state.current.value)
  const options = computed(() =>
    baseline.value.map((page, index) => ({ value: index, label: `第 ${page.page_number} 页` })),
  )
  const picked = computed({
    get: () => state.baselineIndex.value,
    set: value => {
      state.override.value = value == null ? null : Number(value)
    },
  })
  const shown = computed(() =>
    props.side === 'upload'
      ? row.value && {
          src: pageSrc(row.value.page),
          width: row.value.page.width,
          height: row.value.page.height,
          facts: pageFacts(row.value.page),
          alt: `新上传，第 ${row.value.number} 页`,
        }
      : state.baselinePage.value && {
          src: state.baselinePage.value.url,
          width: state.baselinePage.value.width ?? 0,
          height: state.baselinePage.value.height ?? 0,
          facts: pageFacts(state.baselinePage.value),
          alt: `现有版本，第 ${state.baselinePage.value.page_number} 页`,
        },
  )
</script>

<template>
  <Stack gap="none" class="min-h-0">
    <Inline
      gap="md"
      align="center"
      :wrap="false"
      class="h-11 shrink-0 border-b border-line bg-surface px-4"
    >
      <Text size="sm" weight="medium" class="shrink-0">
        {{ side === 'upload' ? '新上传' : '现有版本' }}
      </Text>
      <Text v-if="side === 'upload' && row" size="sm" class="shrink-0 tabular-nums">
        第 {{ row.number }} / {{ state.rows.value.length }} 页
      </Text>
      <Inline v-else gap="xs" align="center" :wrap="false" class="shrink-0">
        <Select
          v-model="picked"
          :options="options"
          size="sm"
          placeholder="选择页面"
          aria-label="选择现有版本的页面"
          class="w-28"
        />
        <Text size="sm" tone="muted" class="tabular-nums">/ {{ baseline.length }}</Text>
      </Inline>
      <Text
        v-for="fact in shown?.facts ?? []"
        :key="fact"
        size="sm"
        tone="muted"
        truncate
        class="tabular-nums"
      >
        {{ fact }}
      </Text>
    </Inline>
    <WorkbenchMangaReviewViewport
      v-if="shown"
      :src="shown.src"
      :width="shown.width"
      :height="shown.height"
      :alt="shown.alt"
      :page-id="side === 'upload' ? row?.page.id : undefined"
      class="min-h-0 flex-1"
    />
    <Empty
      v-else
      size="sm"
      :icon="false"
      :title="side === 'upload' ? '新上传没有这一页' : '现有版本没有对应页'"
      class="min-h-0 flex-1 bg-inset"
    />
  </Stack>
</template>

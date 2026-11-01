<script setup lang="ts">
  import { AspectRatio, Card, Image, Inline, Ripple, Stack, Tag, Text } from '@hina-ui/vue'
  import { FLAG_LABEL } from '~/features/workbench/manga/review/checks'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageSrc } from '~/features/workbench/manga/review/pages'
  import type { ReviewState } from '~/features/workbench/manga/review/useReviewState'

  const props = defineProps<{ row: ReviewState['rows']['value'][number] }>()

  const { state, baseline } = useMangaReview()
  const marks = computed(() => [
    ...(props.row.unmatched ? ['无对应'] : []),
    ...props.row.flags.map(flag => FLAG_LABEL[flag]),
  ])
  const counterpart = computed(() => {
    if (!state.replacement.value) return null
    if (props.row.match === null) return { text: '无对应', tone: 'warning' as const }
    const page = baseline.value[props.row.match]
    return { text: `现有 ${page?.page_number ?? props.row.match + 1}`, tone: 'muted' as const }
  })
</script>

<template>
  <Stack gap="xs">
    <Card
      as="button"
      type="button"
      :padded="false"
      :aria-label="`第 ${row.number} 页${marks.length ? `，${marks.join('、')}` : ''}`"
      class="hn-state-layer relative w-full hn-interactive overflow-hidden hn-press-lg"
      @click="state.open(row.number - 1)"
    >
      <AspectRatio :ratio="2 / 3" class="bg-inset">
        <Image :src="pageSrc(row.page)" alt="" fit="contain" class="size-full" />
      </AspectRatio>
      <Stack
        v-if="marks.length || row.notes"
        gap="xs"
        align="start"
        class="pointer-events-none absolute top-1 left-1"
      >
        <Tag v-for="mark in marks" :key="mark" size="sm" tone="warning">{{ mark }}</Tag>
        <Tag v-if="row.notes" size="sm" tone="accent">批注 {{ row.notes }}</Tag>
      </Stack>
      <Ripple />
    </Card>
    <Inline gap="xs" justify="between" align="baseline" :wrap="false">
      <Text size="xs" weight="medium" class="tabular-nums">第 {{ row.number }} 页</Text>
      <Text v-if="counterpart" size="xs" :tone="counterpart.tone" class="tabular-nums">
        {{ counterpart.text }}
      </Text>
    </Inline>
  </Stack>
</template>

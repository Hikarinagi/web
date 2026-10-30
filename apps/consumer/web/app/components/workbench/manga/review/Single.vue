<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'
  import { pageFacts, pageSrc } from '~/features/workbench/manga/review/pages'

  const { state } = useMangaReview()
  const row = computed(() => state.current.value)
</script>

<template>
  <Stack gap="none" class="min-h-0">
    <Inline
      v-if="row"
      gap="md"
      align="center"
      :wrap="false"
      class="h-10 shrink-0 border-b border-line bg-surface px-4"
    >
      <Text size="sm" weight="medium" class="tabular-nums">第 {{ row.number }} 页</Text>
      <Text
        v-for="fact in pageFacts(row.page)"
        :key="fact"
        size="sm"
        tone="muted"
        class="tabular-nums"
      >
        {{ fact }}
      </Text>
    </Inline>
    <WorkbenchMangaReviewViewport
      v-if="row"
      :src="pageSrc(row.page)"
      :width="row.page.width"
      :height="row.page.height"
      :alt="`第 ${row.number} 页`"
      :page-id="row.page.id"
      class="min-h-0 flex-1"
    />
  </Stack>
</template>

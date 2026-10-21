<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'

  const { state } = useMangaReview()
</script>

<template>
  <Stack as="section" gap="none" class="min-h-0 bg-canvas" aria-label="页面">
    <WorkbenchMangaReviewToolbar />
    <WorkbenchMangaReviewOverviewGrid
      v-if="state.view.value === 'overview'"
      class="min-h-0 flex-1"
    />
    <template v-else>
      <WorkbenchMangaReviewCompare v-if="state.replacement.value" class="min-h-0 flex-1" />
      <WorkbenchMangaReviewSingle v-else class="min-h-0 flex-1" />
      <WorkbenchMangaReviewFilmstrip />
    </template>
  </Stack>
</template>

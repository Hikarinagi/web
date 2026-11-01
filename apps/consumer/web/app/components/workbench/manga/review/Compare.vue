<script setup lang="ts">
  import { Grid } from '@hina-ui/vue'
  import { useMangaReview } from '~/features/workbench/manga/review/context'

  const { state } = useMangaReview()
</script>

<template>
  <Grid v-if="state.mode.value === 'side'" :cols="2" gap="none" class="min-h-0">
    <WorkbenchMangaReviewComparePane side="baseline" class="min-h-0 border-r border-line" />
    <WorkbenchMangaReviewComparePane side="upload" class="min-h-0" />
  </Grid>
  <WorkbenchMangaReviewCompareSwipe v-else-if="state.mode.value === 'swipe'" />
  <WorkbenchMangaReviewCompareToggle v-else />
</template>

<script setup lang="ts">
  import { Drawer, Splitter, SplitterHandle, SplitterPanel } from '@hina-ui/vue'
  import { useMediaQuery } from '@vueuse/core'
  import { projectEpisode, seriesTitle } from '~/features/workbench/manga/series'
  import { useReviewKeys } from '~/features/workbench/manga/review/useReviewKeys'
  import { useReviewWorkspace } from '~/features/workbench/manga/review/useReviewWorkspace'
  import type { MangaReviewPageData } from '~~/server/api/pages/create/manga-review/[id].get'

  const props = defineProps<{ data: MangaReviewPageData }>()
  const emit = defineEmits<{ refresh: [] }>()

  const wide = useMediaQuery('(min-width: 1024px)', { ssrWidth: 1440 })
  const review = useReviewWorkspace({
    project: () => props.data.project,
    pages: () => props.data.pages,
    baseline: () => props.data.baseline,
    check: () => props.data.check,
    notes: () => props.data.review?.notes ?? [],
    narrow: () => !wide.value,
  })
  const asideOpen = ref(false)
  const rejectOpen = ref(false)
  const placementOpen = ref(false)

  useReviewKeys(review.state, {
    note: review.startNote,
    drawing: () => review.drawing.value,
    stop: () => (review.drawing.value = false),
    enabled: () => !rejectOpen.value && !placementOpen.value && !review.pending.value,
  })
  useHead({
    title: () =>
      `审核 ${seriesTitle(props.data.project.series)} ${projectEpisode(props.data.project)}`,
  })
</script>

<template>
  <WorkbenchMangaReviewTopBar
    :narrow="!wide"
    :approving="review.approving.value"
    @reject="rejectOpen = true"
    @approve="review.approve"
    @aside="asideOpen = true"
  />
  <Splitter v-if="wide" auto-save-id="workbench-manga-review" class="min-h-0 flex-1">
    <SplitterPanel :default-size="75" :min-size="50">
      <WorkbenchMangaReviewMain class="h-full" />
    </SplitterPanel>
    <SplitterHandle label="调整侧栏的宽度" />
    <SplitterPanel :default-size="25" :min-size="18" :max-size="40" collapsible>
      <WorkbenchMangaReviewSideAside
        :rerunning="review.rerunning.value"
        class="h-full border-l border-line"
        @rerun="review.rerun"
        @correct="placementOpen = true"
      />
    </SplitterPanel>
  </Splitter>
  <WorkbenchMangaReviewMain v-else class="min-h-0 flex-1" />

  <Drawer v-if="!wide" v-model:open="asideOpen" title="检查与批注" side="end" size="md">
    <template #content>
      <WorkbenchMangaReviewSideAside
        :rerunning="review.rerunning.value"
        @rerun="review.rerun"
        @correct="placementOpen = true"
        @navigate="asideOpen = false"
      />
    </template>
  </Drawer>
  <WorkbenchMangaReviewNoteComposer />
  <WorkbenchMangaReviewRejectDialog v-model:visible="rejectOpen" />
  <WorkbenchMangaProjectInfoDialog
    v-model:visible="placementOpen"
    :project="data.project"
    purpose="correct"
    @saved="emit('refresh')"
  />
</template>

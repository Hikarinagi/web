<script setup lang="ts">
  import { Images, ImagePlus } from '@lucide/vue'
  import { getRevisionEditPath, type WorkResourceSlug } from '~/features/revision/resources'
  import {
    useCoverVote,
    useCoverVoteView,
    toCoverCandidates,
    type CoverVoteWork,
    type CoverVoteState,
    type CoverCandidate,
  } from '~/features/interaction/useCoverVote'

  defineOptions({ name: 'WorkCoverVoteEntry' })

  const props = defineProps<{
    work: CoverVoteWork
    workId: number
    covers: CoverCandidate[]
    myMediaId: number | null
  }>()

  const REVISION_SLUG: Record<CoverVoteWork, WorkResourceSlug> = {
    galgame: 'galgame',
    light_novel: 'light-novel',
    light_novel_volume: 'light-novel-volume',
  }

  const open = ref(false)
  const { vote, retract, busy } = useCoverVote(props.work, props.workId)
  const state = useCoverVoteView(
    props.work,
    props.workId,
    (): CoverVoteState => ({
      my_media_id: props.myMediaId,
      covers: props.covers.map(cover => ({ media_id: cover.media.id, votes: cover.votes })),
    }),
  )
  const candidates = computed(() => toCoverCandidates(props.covers, state.value))
  const editPath = computed(
    () => `${getRevisionEditPath(REVISION_SLUG[props.work], props.workId)}#editor-field-covers`,
  )
</script>

<template>
  <div class="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap">
    <Button
      v-if="covers.length >= 2"
      unstyled
      class="inline-flex items-center gap-1 rounded p-1 text-xs font-medium text-muted-color transition-colors hover:text-color"
      @click="open = true"
    >
      <Images class="size-3.5" />
      <span>封面投票</span>
    </Button>
    <Button
      v-else
      as="router-link"
      :to="editPath"
      target="_blank"
      unstyled
      class="inline-flex items-center gap-1 rounded p-1 text-xs font-medium text-muted-color transition-colors hover:text-color"
    >
      <ImagePlus class="size-3.5" />
      <span>添加封面</span>
    </Button>
  </div>

  <WorkCoverVoteDialog
    v-if="covers.length >= 2"
    v-model:visible="open"
    :candidates="candidates"
    :busy="busy"
    :edit-path="editPath"
    @vote="vote"
    @retract="retract"
  />
</template>

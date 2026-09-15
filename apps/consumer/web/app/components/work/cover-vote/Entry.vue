<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { Images, ImagePlus } from '@lucide/vue'
  import { NuxtLink } from '#components'
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
  const state = useCoverVoteView(props.work, props.workId, (): CoverVoteState => ({
    my_media_id: props.myMediaId,
    covers: props.covers.map(cover => ({ media_id: cover.media.id, votes: cover.votes })),
  }))
  const candidates = computed(() => toCoverCandidates(props.covers, state.value))
  const editPath = computed(
    () => `${getRevisionEditPath(REVISION_SLUG[props.work], props.workId)}#editor-field-covers`,
  )
</script>

<template>
  <Inline
    justify="center"
    :wrap="false"
    class="absolute top-full left-1/2 mt-2 -translate-x-1/2 whitespace-nowrap"
  >
    <Button v-if="covers.length >= 2" variant="link" tone="neutral" size="sm" @click="open = true">
      <template #icon><Images /></template>
      封面投票
    </Button>
    <Button
      v-else
      :as="NuxtLink"
      :to="editPath"
      target="_blank"
      variant="link"
      tone="neutral"
      size="sm"
    >
      <template #icon><ImagePlus /></template>
      添加封面
    </Button>
  </Inline>

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

<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { Images } from '@lucide/vue'
  import { getRevisionEditPath } from '~/features/revision/resources'
  import {
    useCoverVote,
    useCoverVoteState,
    type CoverVoteState,
    type GalgameCover,
  } from '~/features/galgame/useCoverVote'

  defineOptions({ name: 'GalgameCoverVoteEntry', inheritAttrs: false })

  const props = defineProps<{
    galgameId: number
    covers: GalgameCover[]
    mine: CoverVoteState | null
  }>()

  const open = ref(false)
  const { vote, retract, busy } = useCoverVote(props.galgameId)
  const state = useCoverVoteState(
    props.galgameId,
    () => props.covers,
    () => props.mine,
  )
  const editPath = computed(() => getRevisionEditPath('galgame', props.galgameId))
</script>

<template>
  <template v-if="covers.length >= 2">
    <IconButton
      v-bind="$attrs"
      label="封面投票"
      variant="soft"
      tone="neutral"
      size="sm"
      @click="open = true"
    >
      <Images />
    </IconButton>
    <GalgameCoverVoteDialog
      v-model:visible="open"
      :covers="covers"
      :state="state"
      :busy="busy"
      :edit-path="editPath"
      @vote="vote"
      @retract="retract"
    />
  </template>
</template>

<script setup lang="ts">
  import { AspectRatio, Dialog, Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { COVER_KIND_LABELS, langLabel } from '~/features/galgame/labels'
  import type { CoverVoteState, GalgameCover } from '~/features/galgame/useCoverVote'

  defineOptions({ name: 'GalgameCoverVoteDialog' })

  const props = defineProps<{
    covers: GalgameCover[]
    state: CoverVoteState
    busy: boolean
    editPath: string
  }>()
  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ vote: [mediaId: number]; retract: [] }>()

  const candidates = computed(() => {
    const tally = new Map(props.state.covers.map(cover => [cover.media_id, cover.votes]))
    return props.covers.map(cover => ({
      media: cover.media,
      votes: tally.get(cover.media.id) ?? cover.votes,
      mine: props.state.my_media_id === cover.media.id,
      note: [cover.kind ? COVER_KIND_LABELS[cover.kind] : '', langLabel(cover.language)]
        .filter(Boolean)
        .join('　'),
    }))
  })

  function pick(candidate: (typeof candidates.value)[number]) {
    if (props.busy) return
    if (candidate.mine) emit('retract')
    else emit('vote', candidate.media.id)
  }
</script>

<template>
  <Dialog v-model:open="visible" title="封面投票" size="lg" :locked="busy">
    <template #content>
      <Grid :cols="2" gap="md">
        <Stack v-for="candidate in candidates" :key="candidate.media.id" gap="sm">
          <AspectRatio :ratio="3 / 4" class="overflow-hidden rounded-lg bg-subtle">
            <HikariImage
              :src="candidate.media"
              preview
              alt="候选封面"
              class="size-full"
              image-class="object-contain"
              :processing="{ width: 480, quality: 88, fit: 'scale-down' }"
            />
          </AspectRatio>
          <Text v-if="candidate.note" size="xs" tone="muted">{{ candidate.note }}</Text>
          <Inline align="center" justify="between" :wrap="false">
            <Text
              size="sm"
              :tone="candidate.mine ? 'accent' : 'muted'"
              :weight="candidate.mine ? 'medium' : 'normal'"
              class="tabular-nums"
            >
              {{ candidate.votes }} 票
            </Text>
            <Button
              login-required
              :variant="candidate.mine ? 'soft' : 'outline'"
              :tone="candidate.mine ? 'accent' : 'neutral'"
              :disabled="busy"
              @click="pick(candidate)"
            >
              {{ candidate.mine ? '已投' : '投这张' }}
            </Button>
          </Inline>
        </Stack>
      </Grid>
    </template>

    <template #footer>
      <Inline align="center" gap="xs" justify="start" class="w-full">
        <Text size="sm" tone="muted">选择你认为最适合展示给大家的封面，你也可以</Text>
        <Button :as="NuxtLink" :to="editPath" target="_blank" variant="link" size="sm">
          添加新封面
        </Button>
      </Inline>
    </template>
  </Dialog>
</template>

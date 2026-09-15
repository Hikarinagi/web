<script setup lang="ts">
  import { AspectRatio, Button, Dialog, Grid, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CoverVoteCandidate } from '~/features/interaction/useCoverVote'

  defineOptions({ name: 'WorkCoverVoteDialog' })

  const props = defineProps<{
    candidates: CoverVoteCandidate[]
    busy: boolean
    editPath: string
  }>()

  const visible = defineModel<boolean>('visible', { required: true })
  const emit = defineEmits<{ vote: [mediaId: number]; retract: [] }>()

  function pick(candidate: CoverVoteCandidate) {
    if (props.busy) return
    if (candidate.mine) emit('retract')
    else if (candidate.media?.id != null) emit('vote', candidate.media.id)
  }
</script>

<template>
  <Dialog v-model:open="visible" title="封面投票" size="lg" :locked="busy">
    <template #content>
      <Grid :cols="2" gap="md">
        <Stack
          v-for="candidate in candidates"
          :key="candidate.media?.id ?? candidate.votes"
          gap="sm"
        >
          <AspectRatio :ratio="7 / 10" class="relative overflow-hidden rounded-lg bg-subtle">
            <HikariImage
              :src="candidate.media"
              preview
              alt="候选封面"
              class="size-full"
              image-class="object-cover"
              :processing="{ width: 480, quality: 88, fit: 'cover' }"
            />
          </AspectRatio>

          <Inline align="center" justify="between" :wrap="false">
            <Text
              size="sm"
              :tone="candidate.mine ? 'accent' : 'muted'"
              :weight="candidate.mine ? 'medium' : 'normal'"
              class="tabular-nums"
            >
              {{ candidate.votes }} 票
            </Text>
            <AuthGateButton
              :variant="candidate.mine ? 'soft' : 'outline'"
              :tone="candidate.mine ? 'accent' : 'neutral'"
              :disabled="busy"
              @click="pick(candidate)"
            >
              {{ candidate.mine ? '已投' : '投这张' }}
            </AuthGateButton>
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

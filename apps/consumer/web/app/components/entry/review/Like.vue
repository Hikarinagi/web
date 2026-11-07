<script setup lang="ts">
  import { useLike, useLikeView, type LikeKind } from '~/features/interaction/useLike'

  defineOptions({ name: 'EntryReviewLike' })
  const props = defineProps<{
    kind: LikeKind
    rateId: number
    workId: number
    likes: number
    liked: boolean
  }>()

  const { toggle, busy } = useLike(props.kind)
  const view = useLikeView(props.kind, props.rateId, () => ({
    like_count: props.likes,
    liked: props.liked,
  }))
</script>

<template>
  <Button
    login-required
    variant="ghost"
    :tone="view.liked ? 'accent' : 'neutral'"
    size="sm"
    class="-ml-2 self-start"
    :loading="busy"
    :disabled="busy"
    aria-label="赞"
    @click="toggle(rateId, { parentId: workId, liked: view.liked })"
  >
    <template #icon><InteractionLikeIcon :active="view.liked" /></template>
    {{ view.like_count }}
  </Button>
</template>

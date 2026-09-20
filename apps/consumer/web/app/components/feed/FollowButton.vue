<script setup lang="ts">
  import { Check, Plus } from '@lucide/vue'
  import { useFollowTag } from '~/features/feed/useFollowTag'

  defineOptions({ name: 'FeedFollowButton' })

  const props = withDefaults(
    defineProps<{
      kind: 'topic' | 'section'
      id: number
      initialFollowing?: boolean
      size?: 'small' | 'large'
    }>(),
    { initialFollowing: false, size: 'small' },
  )

  const { following, pending, toggle } = useFollowTag(props.kind, props.id, props.initialFollowing)
</script>

<template>
  <Button
    login-required
    :size="size"
    :label="following ? '已关注' : '关注'"
    :severity="following ? 'secondary' : undefined"
    :loading="pending"
    class="shrink-0"
    @click="toggle"
  >
    <template #icon>
      <component :is="following ? Check : Plus" class="size-3.5" />
    </template>
  </Button>
</template>

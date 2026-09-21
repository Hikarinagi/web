<script setup lang="ts">
  import { Check, Plus } from '@lucide/vue'
  import { useFollowTag } from '~/features/feed/useFollowTag'

  defineOptions({ name: 'FeedFollowButton' })

  const props = withDefaults(
    defineProps<{
      kind: 'topic' | 'section'
      id: number
      initialFollowing?: boolean
      size?: 'sm' | 'md' | 'lg'
    }>(),
    { initialFollowing: false, size: 'sm' },
  )

  const { following, pending, toggle } = useFollowTag(props.kind, props.id, props.initialFollowing)
</script>

<template>
  <Button
    login-required
    :size="size"
    :variant="following ? 'soft' : 'solid'"
    :tone="following ? 'neutral' : 'accent'"
    :loading="pending"
    class="shrink-0"
    @click="toggle"
  >
    <template #icon>
      <component :is="following ? Check : Plus" />
    </template>
    {{ following ? '已关注' : '关注' }}
  </Button>
</template>

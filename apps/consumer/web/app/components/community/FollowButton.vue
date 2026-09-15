<script setup lang="ts">
  import { Plus, UserCheck } from '@lucide/vue'

  const props = withDefaults(
    defineProps<{ userId: number; initialFollowing?: boolean; size?: 'sm' | 'md' | 'lg' }>(),
    { initialFollowing: false, size: 'md' },
  )

  defineOptions({ inheritAttrs: false })

  const { following, pending, confirmOpen, toggle, unfollow } = useFollow(
    props.userId,
    props.initialFollowing,
  )
</script>

<template>
  <AuthGateButton
    v-bind="$attrs"
    :size="size"
    :variant="following ? 'soft' : 'solid'"
    :tone="following ? 'neutral' : 'accent'"
    :loading="pending"
    class="shrink-0"
    @click="toggle"
  >
    <template #icon>
      <component :is="following ? UserCheck : Plus" />
    </template>
    {{ following ? '已关注' : '关注' }}
  </AuthGateButton>

  <UserUnfollowDialog v-model:open="confirmOpen" :confirm="unfollow" />
</template>

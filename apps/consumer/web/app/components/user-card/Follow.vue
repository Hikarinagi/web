<script setup lang="ts">
  import { UserCheck, UserPlus } from '@lucide/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'

  defineOptions({ inheritAttrs: false })

  const { isFollowing, toggling, confirmOpen, toggleFollow, unfollow } = useUserCardFollow()
</script>

<template>
  <AuthGateButton
    v-bind="$attrs"
    :variant="isFollowing ? 'soft' : 'solid'"
    :tone="isFollowing ? 'neutral' : 'accent'"
    :loading="toggling"
    pill
    @click="toggleFollow"
  >
    <template #icon>
      <component :is="isFollowing ? UserCheck : UserPlus" />
    </template>
    {{ isFollowing ? '已关注' : '关注' }}
  </AuthGateButton>

  <UserUnfollowDialog v-model:open="confirmOpen" :confirm="unfollow" />
</template>

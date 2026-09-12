<script setup lang="ts">
  import { UserCheck, UserPlus } from '@lucide/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'

  const { isFollowing, toggling, toggleFollow } = useUserCardFollow()
</script>

<template>
  <AuthGateButton
    :tone="isFollowing ? 'neutral' : 'accent'"
    :loading="toggling"
    size="sm"
    pill
    @click="toggleFollow"
  >
    <template #icon>
      <component :is="isFollowing ? UserCheck : UserPlus" />
    </template>
    {{ isFollowing ? '已关注' : '关注' }}
  </AuthGateButton>
</template>

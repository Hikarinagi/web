<script setup lang="ts">
  import { UserCheck, UserPlus } from '@lucide/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'

  const { isFollowing, toggling, toggleFollow } = useUserCardFollow()
</script>

<template>
  <Button
    :label="isFollowing ? '已关注' : '关注'"
    :severity="isFollowing ? 'secondary' : undefined"
    :loading="toggling"
    size="small"
    rounded
    login-required
    @click="toggleFollow"
  >
    <template v-if="!toggling" #icon>
      <component :is="isFollowing ? UserCheck : UserPlus" class="size-4" />
    </template>
  </Button>
</template>

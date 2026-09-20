<script setup lang="ts">
  import { Users } from '@lucide/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()

  const { followerCount } = useUserCardFollow()
</script>

<template>
  <div class="mt-3 flex items-center gap-1.5 text-xs text-muted-color">
    <Users class="size-3.5" />
    <span>
      <strong class="font-semibold text-color">{{ user.following_count }}</strong>
      关注
    </span>
    <span>·</span>
    <span>
      <strong class="font-semibold text-color">{{ followerCount }}</strong>
      粉丝
    </span>
  </div>
</template>

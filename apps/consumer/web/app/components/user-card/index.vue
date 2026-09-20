<script setup lang="ts">
  import { toRef } from 'vue'
  import type { UserCardData } from './composables/useUserCard'
  import { provideUserCardFollow } from './composables/useUserCardFollow'

  const props = defineProps<{
    user: UserCardData | null
    loading: boolean
  }>()

  provideUserCardFollow(toRef(props, 'user'))
</script>

<template>
  <div
    class="w-80 overflow-hidden rounded-xl border border-surface-200 bg-surface-0 shadow-[0_16px_48px_rgba(0,0,0,0.18)] dark:border-surface-700 dark:bg-surface-900"
  >
    <UserCardCover :src="user?.head_cover?.src" />
    <div class="relative px-4 pb-4">
      <UserCardHeader :user="user" />
      <template v-if="user">
        <UserCardIdentity :user="user" />
        <UserCardBio :user="user" />
        <UserCardStats :user="user" />
      </template>
      <UserCardSkeleton v-else />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
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
  <Stack gap="none">
    <UserCardCover :src="user?.head_cover?.src" />
    <Stack gap="none" class="relative px-4 pb-4">
      <UserCardHeader :user="user" />
      <template v-if="user">
        <UserCardIdentity :user="user" />
        <UserCardBio :user="user" />
        <UserCardStats :user="user" />
      </template>
      <UserCardSkeleton v-else />
    </Stack>
  </Stack>
</template>

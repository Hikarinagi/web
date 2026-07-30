<script setup lang="ts">
  import { useUserCardFollow } from './composables/useUserCardFollow'
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()

  const { isMutual } = useUserCardFollow()
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <NuxtLink
      :to="`/space/${user.id}`"
      class="transition-colors hover:text-primary-400 active:text-primary-500"
    >
      <UserName
        :user="user"
        full
        handle-class="text-sm"
        class="items-center text-lg font-semibold text-color"
      />
    </NuxtLink>
    <UserBadges :user="user" height="h-5" full />
    <Tag v-if="isMutual" value="互相关注" severity="secondary" />
  </div>
</template>

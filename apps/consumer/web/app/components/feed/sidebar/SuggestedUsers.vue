<script setup lang="ts">
  import type { SidebarSuggestedUser } from '~/features/feed/sidebar'

  defineProps<{ users: SidebarSuggestedUser[] }>()
</script>

<template>
  <ul class="pb-1.5">
    <li v-for="user in users" :key="user.id" class="flex items-center gap-3 px-4 py-3">
      <Avatar :user="user" card class="size-9! shrink-0" />
      <div class="flex min-w-0 flex-1 flex-col gap-0.5">
        <UserName :user="user" class="text-[13px] font-semibold text-color" />
        <p v-if="user.signature" class="truncate text-xs text-muted-color">{{ user.signature }}</p>
        <p v-if="user.mutual_count > 0" class="truncate text-[11px] text-surface-400">
          {{ user.mutual_count }} 个共同关注
        </p>
      </div>
      <CommunityFollowButton :user-id="user.id" />
    </li>
  </ul>
</template>

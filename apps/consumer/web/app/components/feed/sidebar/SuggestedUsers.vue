<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { SidebarSuggestedUser } from '~/features/feed/sidebar'

  defineProps<{ users: SidebarSuggestedUser[] }>()
</script>

<template>
  <Stack gap="none" class="pb-1.5">
    <Inline
      v-for="user in users"
      :key="user.id"
      gap="md"
      align="center"
      :wrap="false"
      class="px-(--hn-panel-p) py-3"
    >
      <Avatar :user="user" card class="size-9! shrink-0" />
      <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
        <UserName :user="user" class="text-xs font-semibold text-fg" />
        <Text v-if="user.signature" size="xs" tone="muted" truncate>{{ user.signature }}</Text>
        <Text v-if="user.mutual_count > 0" size="xs" tone="faint" truncate>
          {{ user.mutual_count }} 个共同关注
        </Text>
      </Stack>
      <CommunityFollowButton :user-id="user.id" />
    </Inline>
  </Stack>
</template>

<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import { Users } from '@lucide/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()

  const { followerCount } = useUserCardFollow()
</script>

<template>
  <Inline align="center" gap="none" class="mt-3 gap-1.5 text-muted">
    <Users class="size-3.5" />
    <Text as="span" size="xs" tone="muted">
      <Text as="strong" size="xs" weight="semibold" class="text-fg">
        {{ user.following_count }}
      </Text>
      关注
    </Text>
    <Text as="span" size="xs" tone="muted">·</Text>
    <Text as="span" size="xs" tone="muted">
      <Text as="strong" size="xs" weight="semibold" class="text-fg">{{ followerCount }}</Text>
      粉丝
    </Text>
  </Inline>
</template>

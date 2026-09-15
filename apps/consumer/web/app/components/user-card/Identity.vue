<script setup lang="ts">
  import { Inline, Link, Tag } from '@hina-ui/vue'
  import { useUserCardFollow } from './composables/useUserCardFollow'
  import type { UserCardData } from './composables/useUserCard'

  defineProps<{
    user: UserCardData
  }>()

  const { isMutual } = useUserCardFollow()
</script>

<template>
  <Inline align="center" gap="sm">
    <NuxtLink v-slot="{ href, navigate }" :to="`/space/${user.id}`" custom>
      <Link
        :href="href ?? undefined"
        tone="neutral"
        :underline="false"
        class="hover:text-accent-text"
        @click="navigate"
      >
        <UserName
          :user="user"
          full
          handle-class="text-sm"
          class="items-center text-lg font-semibold"
        />
      </Link>
    </NuxtLink>
    <UserBadges :user="user" height="h-5" full />
    <Tag v-if="isMutual">互相关注</Tag>
  </Inline>
</template>

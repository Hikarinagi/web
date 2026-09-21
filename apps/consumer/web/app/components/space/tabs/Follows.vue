<script setup lang="ts">
  import { Chip, Inline, Stack, Text } from '@hina-ui/vue'
  import { Users } from '@lucide/vue'
  import type { PaginatorPageInput } from '~/components/ui/paginator/types'
  import { SPACE_FOLLOW_PAGE_SIZE, type SpaceFollowPage } from '~/features/space/space'
  import { usePagedList } from '~/features/space/usePagedList'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'SpaceTabsFollows' })

  const props = defineProps<{
    userId: number
    followingCount: number
    followerCount: number
    following: SpaceFollowPage
    followers: SpaceFollowPage
  }>()

  const sub = ref<'following' | 'followers'>('following')

  const following = usePagedList(props.following, page =>
    hikariRequest('/api/v3/user/{id}/following', {
      path: { id: props.userId },
      query: { page, page_size: SPACE_FOLLOW_PAGE_SIZE },
    }),
  )
  const followers = shallowRef<SpaceFollowPage | null>(props.followers)
  const followersPending = ref(false)

  async function loadFollowers(input: PaginatorPageInput) {
    const page = typeof input === 'number' ? input : input.page
    followersPending.value = true
    try {
      const next = (await hikariRequest('/api/v3/user/{id}/followers', {
        path: { id: props.userId },
        query: { page, page_size: SPACE_FOLLOW_PAGE_SIZE },
      })) as SpaceFollowPage
      await (typeof input === 'number' ? undefined : input.ready)
      followers.value = next
    } finally {
      followersPending.value = false
    }
  }

  const list = computed(() => (sub.value === 'following' ? following.list.value : followers.value))
  const pending = computed(() =>
    sub.value === 'following' ? following.pending.value : followersPending.value,
  )

  function onPage(event: PaginatorPageInput) {
    if (sub.value === 'following') {
      void following.loadPage(event)
      return
    }
    void loadFollowers(event)
  }
</script>

<template>
  <Stack gap="md" class="pt-2">
    <Inline gap="sm">
      <Chip
        v-for="s in ['following', 'followers'] as const"
        :key="s"
        selectable
        :selected="sub === s"
        :tone="sub === s ? 'accent' : 'neutral'"
        @update:selected="sub = s"
      >
        {{ s === 'following' ? `关注 ${followingCount}` : `粉丝 ${followerCount}` }}
      </Chip>
    </Inline>

    <Stack v-if="list?.items.length" gap="none" class="relative">
      <Inline
        v-for="u in list.items"
        :key="u.id"
        gap="sm"
        :wrap="false"
        class="border-b border-line py-3 last:border-b-0"
      >
        <NuxtLink :to="`/space/${u.id}`" class="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            :user="u"
            card
            class="size-11! shrink-0"
            :processing="{ width: 88, height: 88, fit: 'cover', quality: 86 }"
          />
          <Stack gap="none" class="min-w-0">
            <Text weight="medium" truncate>{{ displayName(u) }}</Text>
            <Text v-if="displayName(u) !== u.name" size="xs" tone="muted" truncate>
              @{{ u.name }}
            </Text>
          </Stack>
        </NuxtLink>
        <CommunityFollowButton :user-id="u.id" />
      </Inline>
      <LoadingOverlay :visible="pending" />
    </Stack>
    <SpaceEmptyState v-else-if="pending" :icon="Users" text="加载中" />
    <SpaceEmptyState
      v-else
      :icon="Users"
      :text="sub === 'following' ? '还没有关注任何人' : '还没有粉丝'"
    />
    <Paginator
      v-if="list && list.meta.total_items > list.meta.page_size"
      :meta="list.meta"
      :loading="pending"
      route="replace"
      @change="onPage"
    />
  </Stack>
</template>

<script setup lang="ts">
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
  <div class="flex flex-col gap-4 pt-2">
    <div class="flex items-center gap-2">
      <Button
        v-for="s in ['following', 'followers'] as const"
        :key="s"
        unstyled
        class="cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
        :class="sub === s ? 'bg-primary/10 text-primary' : 'text-muted-color hover:text-color'"
        @click="sub = s"
      >
        {{ s === 'following' ? `关注 ${followingCount}` : `粉丝 ${followerCount}` }}
      </Button>
    </div>

    <LoadingOverlay v-if="list?.items.length" :loading="pending" content-class="flex flex-col">
      <div
        v-for="u in list.items"
        :key="u.id"
        class="flex items-center gap-3 border-b border-surface-100 py-3 last:border-b-0 dark:border-surface-800/60"
      >
        <NuxtLink :to="`/space/${u.id}`" class="flex min-w-0 flex-1 items-center gap-3">
          <Avatar
            :user="u"
            card
            shape="circle"
            class="size-11! shrink-0"
            :processing="{ width: 88, height: 88, fit: 'cover', quality: 86 }"
          />
          <div class="min-w-0">
            <p class="truncate font-medium text-color">{{ displayName(u) }}</p>
            <p v-if="displayName(u) !== u.name" class="truncate text-xs text-muted-color">
              @{{ u.name }}
            </p>
          </div>
        </NuxtLink>
        <CommunityFollowButton :user-id="u.id" />
      </div>
    </LoadingOverlay>
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
  </div>
</template>

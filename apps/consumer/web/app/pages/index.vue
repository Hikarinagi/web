<script setup lang="ts">
  import type { FeedScope } from '~/features/feed/feed'
  import { homeFeedSource } from '~/features/feed/sources'
  import { useFeedRefreshSignal, useFeedReset } from '~/features/feed/useFeedStream'
  import { useFeedTabs } from '~/features/feed/useFeedTabs'

  defineOptions({ name: 'HomePage' })
  definePageMeta({ footer: false, container: 'full', headerFlush: true })

  const { request: requestFeedRefresh } = useFeedRefreshSignal()
  const { scope, shift } = useFeedTabs(requestFeedRefresh)

  // 首屏 seed 的是落地时那个 tab。这里刻意取快照而非响应式引用:BFF 的 key 跟着变会让
  // 每次切 tab 都重拉一次侧栏。切 tab 后的流由 feed 接口自己拉。
  const landedScope = scope.value
  const { data, refresh } = await useHikariApiData(`/api/pages/home?tab=${landedScope}`)

  const seedFor = (key: FeedScope) => () => (key === landedScope ? data.value?.feed : undefined)
  const allSource = homeFeedSource('all', seedFor('all'))
  const recommendSource = homeFeedSource('recommend', seedFor('recommend'))
  const latestSource = homeFeedSource('latest', seedFor('latest'))
  const followingSource = homeFeedSource('following', seedFor('following'))
  const mounted = ref<Partial<Record<FeedScope, boolean>>>({})
  watch(
    scope,
    s => {
      if (s !== 'all') mounted.value = { ...mounted.value, [s]: true }
      if (import.meta.client) window.scrollTo({ top: 0, behavior: 'instant' })
    },
    { immediate: true },
  )

  const feedArea = ref<HTMLElement | null>(null)
  useSwipe(feedArea, {
    threshold: 60,
    onSwipeEnd(_event, direction) {
      if (direction === 'left') shift(1)
      else if (direction === 'right') shift(-1)
    },
  })
  const auth = useAuthStore()
  const router = useRouter()
  const resetFeed = useFeedReset()
  watch(
    () => auth.isAuthenticated,
    isAuthed => {
      // 登出后关注流无意义,退回全站;清空 feed 桶以新身份重拉,并按登录态切换重拉一次 BFF。
      // 列表内容整体换身份,深滚位置已无意义,直接回顶。
      if (!isAuthed && scope.value === 'following') void router.replace({ path: '/', query: {} })
      resetFeed()
      if (import.meta.client) window.scrollTo(0, 0)
      if (data.value && data.value.sidebar.authenticated !== isAuthed) refresh()
    },
  )
</script>

<template>
  <FeedPageShell v-if="data" lock-overscroll>
    <template #top>
      <FeedTabs class="w-full xl:hidden" @select="requestFeedRefresh" />
    </template>

    <template #nav>
      <FeedTabs orientation="vertical" @select="requestFeedRefresh" />
    </template>

    <div ref="feedArea">
      <FeedComposer class="mb-4" />
      <FeedList v-show="scope === 'all'" :source="allSource" :active="scope === 'all'" />
      <FeedList
        v-if="mounted.recommend"
        v-show="scope === 'recommend'"
        :source="recommendSource"
        :active="scope === 'recommend'"
      />
      <FeedList
        v-if="mounted.latest"
        v-show="scope === 'latest'"
        :source="latestSource"
        :active="scope === 'latest'"
      />
      <FeedList
        v-if="mounted.following"
        v-show="scope === 'following'"
        :source="followingSource"
        :active="scope === 'following'"
      />
    </div>

    <template #sidebar>
      <FeedSidebar :data="data.sidebar" />
    </template>
  </FeedPageShell>
</template>

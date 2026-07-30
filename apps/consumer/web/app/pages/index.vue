<script setup lang="ts">
  import type { FeedScope } from '~/features/feed/feed'
  import { homeFeedSource } from '~/features/feed/sources'
  import { useFeedReset } from '~/features/feed/useFeedStream'

  defineOptions({ name: 'HomePage' })
  definePageMeta({ footer: false })

  const { data, refresh } = await useHikariApiData('/api/pages/home')

  const scope = ref<FeedScope>('recommend')
  const recommendSource = homeFeedSource('recommend', () => data.value?.feed)
  const followingSource = homeFeedSource('following', () => undefined)
  const followingMounted = ref(false)
  watch(scope, s => {
    if (s === 'following') followingMounted.value = true
  })
  const topicCount = computed(() =>
    data.value?.sidebar.authenticated ? data.value.sidebar.followed_topics.total : 0,
  )

  const auth = useAuthStore()
  const resetFeed = useFeedReset()
  watch(
    () => auth.isAuthenticated,
    isAuthed => {
      // 登出后关注流无意义,退回推荐;清空 feed 桶以新身份重拉,并按登录态切换重拉一次 BFF。
      // 列表内容整体换身份,深滚位置已无意义,直接回顶。
      if (!isAuthed) scope.value = 'recommend'
      resetFeed()
      if (import.meta.client) window.scrollTo(0, 0)
      if (data.value && data.value.sidebar.authenticated !== isAuthed) refresh()
    },
  )
</script>

<template>
  <FeedPageShell v-if="data">
    <template #top>
      <FeedTabs v-model="scope" :topic-count="topicCount" class="w-full" />
    </template>

    <FeedComposer class="mb-4" />
    <FeedList
      v-show="scope === 'recommend'"
      :source="recommendSource"
      :active="scope === 'recommend'"
    />
    <FeedList
      v-if="followingMounted"
      v-show="scope === 'following'"
      :source="followingSource"
      :active="scope === 'following'"
    />

    <template #sidebar>
      <FeedSidebar :data="data.sidebar" />
    </template>
  </FeedPageShell>
</template>

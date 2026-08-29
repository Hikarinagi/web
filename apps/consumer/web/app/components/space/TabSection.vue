<script setup lang="ts">
  import type { SpacePageData } from '~~/server/api/pages/space/[id].get'
  import type { SpaceTabPageData } from '~~/server/api/pages/space/[id]/tab.get'
  import { readSpaceRouteQuery, spaceTabBffPath } from '~/features/space/route'
  import type { SpaceTabKey } from '~/features/space/space'

  defineOptions({ name: 'SpaceTabSection' })

  const props = defineProps<{ userId: number; initial: SpacePageData }>()

  const route = useRoute()
  const router = useRouter()
  const nuxtApp = useNuxtApp()
  const tabPage = shallowRef(toTabPage(props.initial))
  const pendingRoute = shallowRef({ ...readRouteState(), tab: tabPage.value.active_tab })
  const requestUrl = computed(() => spaceTabBffPath(props.userId, pendingRoute.value))
  const {
    data: loadedTab,
    error,
    execute,
  } = useHikariApiData<SpaceTabPageData>(requestUrl, {
    immediate: false,
    watch: false,
  })

  let syncingTabRoute = false
  let requestSeq = 0
  const selectedTab = computed<SpaceTabKey>({
    get: () => tabPage.value.active_tab,
    set: next => {
      void loadTab(next, true)
    },
  })

  watch(
    () => [route.query.tab, route.query.shelf],
    () => {
      if (syncingTabRoute) return
      const next = readRouteState()
      if (next.tab !== tabPage.value.active_tab || !sameShelf(next.tab, next.shelf)) {
        void loadTab(next.tab, false)
      }
    },
  )

  function sameShelf(tab: SpaceTabKey, shelf: string) {
    if (tab !== 'bookshelf') return true
    return shelf === (tabPage.value.bookshelf?.shelf ?? 'novel')
  }

  async function loadTab(next: SpaceTabKey, syncRoute: boolean) {
    if (next === tabPage.value.active_tab && sameShelf(next, readRouteState().shelf)) {
      if (syncRoute) await replaceTab(next)
      return
    }

    const seq = ++requestSeq
    const current = readRouteState()
    pendingRoute.value = syncRoute
      ? { ...current, page: 1, tab: next, work: 'all', status: 'all' }
      : { ...current, tab: next }
    await nuxtApp.callHook('page:loading:start')
    try {
      await execute()
      if (seq !== requestSeq || error.value || !loadedTab.value) return

      if (syncRoute) await replaceTab(next)
      tabPage.value = loadedTab.value
    } catch {
      /* empty */
    } finally {
      await nuxtApp.callHook('page:loading:end')
    }
  }

  function readRouteState() {
    return readSpaceRouteQuery(route.query)
  }

  async function replaceTab(tab: SpaceTabKey) {
    syncingTabRoute = true
    try {
      await router.replace({
        query: {
          ...route.query,
          page: undefined,
          page_size: undefined,
          work: undefined,
          status: undefined,
          tab: tab === 'feed' ? undefined : tab,
        },
      })
      await nextTick()
    } finally {
      syncingTabRoute = false
    }
  }

  function toTabPage(data: SpacePageData): SpaceTabPageData {
    return {
      active_tab: data.active_tab,
      is_self: data.is_self,
      feed: data.feed,
      contents: data.contents,
      managed: data.managed,
      rates: data.rates,
      collections: data.collections,
      contributions: data.contributions,
      following: data.following,
      followers: data.followers,
      bookshelf: data.bookshelf,
    }
  }
</script>

<template>
  <div class="min-w-0 flex-1">
    <SpaceTabs v-model="selectedTab" :is-self="initial.is_self" />
    <div class="pt-2">
      <SpaceTabsFeed
        v-if="selectedTab === 'feed' && tabPage.feed"
        :user-id="userId"
        :is-self="initial.is_self"
        :feed="tabPage.feed"
      />
      <SpaceTabsArticles
        v-else-if="selectedTab === 'articles' && tabPage.contents"
        :user-id="userId"
        :contents="tabPage.contents"
      />
      <SpaceTabsContentManage
        v-else-if="selectedTab === 'my-posts' && tabPage.managed"
        :managed="tabPage.managed"
        type="post"
      />
      <SpaceTabsContentManage
        v-else-if="selectedTab === 'my-articles' && tabPage.managed"
        :managed="tabPage.managed"
        type="article"
      />
      <SpaceTabsRates
        v-else-if="selectedTab === 'rates' && tabPage.rates"
        :user-id="userId"
        :rates="tabPage.rates"
        :counts="initial.statistics.rate_status_counts"
      />
      <SpaceTabsCollections
        v-else-if="selectedTab === 'collections' && tabPage.collections"
        :user-id="userId"
        :is-self="initial.is_self"
        :collections="tabPage.collections"
      />
      <SpaceTabsContributions
        v-else-if="selectedTab === 'contributions' && tabPage.contributions"
        :user-id="userId"
        :contributions="tabPage.contributions"
        :statistics="initial.statistics"
      />
      <SpaceTabsFollows
        v-else-if="selectedTab === 'follows' && tabPage.following && tabPage.followers"
        :user-id="userId"
        :following-count="initial.profile.following_count"
        :follower-count="initial.profile.follower_count"
        :following="tabPage.following"
        :followers="tabPage.followers"
      />
      <SpaceTabsBookshelf
        v-else-if="selectedTab === 'bookshelf' && initial.is_self && tabPage.bookshelf"
        :user-id="userId"
        :bookshelf="tabPage.bookshelf"
      />
    </div>
  </div>
</template>

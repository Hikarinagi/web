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
  const pendingRoute = shallowRef({
    page: readRouteState().page,
    tab: tabPage.value.active_tab,
  })
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
    () => route.query.tab,
    () => {
      if (syncingTabRoute) return
      const next = readRouteState()
      if (next.tab !== tabPage.value.active_tab) {
        void loadTab(next.tab, false)
      }
    },
  )

  async function loadTab(next: SpaceTabKey, syncRoute: boolean) {
    if (next === tabPage.value.active_tab) {
      if (syncRoute) await replaceTab(next)
      return
    }

    const seq = ++requestSeq
    pendingRoute.value = {
      page: syncRoute ? 1 : readRouteState().page,
      tab: next,
    }
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
      rates: data.rates,
      collections: data.collections,
      contributions: data.contributions,
      following: data.following,
      followers: data.followers,
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
      <SpaceTabsRates
        v-else-if="selectedTab === 'rates' && tabPage.rates"
        :user-id="userId"
        :rates="tabPage.rates"
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
    </div>
  </div>
</template>

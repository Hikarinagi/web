<script setup lang="ts">
  import { breakpointsTailwind } from '@vueuse/core'
  import { storeToRefs } from 'pinia'

  defineOptions({ name: 'EmojiDrawer' })

  const store = useEmojiManageStore()
  const { open } = storeToRefs(store)
  const tab = ref<'owned' | 'subscriptions'>('owned')
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')
  const position = computed(() => (isMobile.value ? 'bottom' : 'right'))
  const rootClass = computed(() =>
    isMobile.value ? 'app-mobile-sheet h-[82dvh]!' : 'w-[min(94vw,38rem)]!',
  )
</script>

<template>
  <Drawer
    v-model:visible="open"
    :position="position"
    header="贴纸包管理"
    :pt="{
      root: { class: rootClass },
      content: { class: '!flex !min-h-0 !flex-col' },
    }"
  >
    <Tabs v-model:value="tab" class="flex min-h-0 flex-1 flex-col">
      <TabList>
        <Tab value="owned">我的贴纸包</Tab>
        <Tab value="subscriptions">已订阅</Tab>
      </TabList>
      <TabPanels class="min-h-0 flex-1" :pt="{ root: { class: 'p-0! pt-4!' } }">
        <TabPanel value="owned">
          <EmojiOwnedList />
        </TabPanel>
        <TabPanel value="subscriptions">
          <EmojiSubscriptionList />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Drawer>
</template>

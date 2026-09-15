<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hina-ui/vue'

  defineOptions({ name: 'EmojiManagePanel' })

  const tab = ref<'owned' | 'subscriptions'>('owned')
</script>

<template>
  <Tabs v-model="tab" class="flex min-h-0 flex-1 flex-col">
    <TabsList label="贴纸包分类">
      <TabsTrigger value="owned">我的贴纸包</TabsTrigger>
      <TabsTrigger value="subscriptions">已订阅</TabsTrigger>
    </TabsList>
    <TabsContent value="owned" class="min-h-0 flex-1 pt-4">
      <EmojiOwnedList />
    </TabsContent>
    <TabsContent value="subscriptions" class="min-h-0 flex-1 pt-4">
      <EmojiSubscriptionList />
    </TabsContent>
  </Tabs>
</template>

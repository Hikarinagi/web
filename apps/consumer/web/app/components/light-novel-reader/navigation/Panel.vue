<script setup lang="ts">
  import {
    Center,
    CloseButton,
    Flex,
    Inline,
    ScrollArea,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
  } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderNavigationPanel' })

  defineProps<{ standalone?: boolean }>()
  const emit = defineEmits<{ close: [] }>()

  const { shell, bookmarks, highlights, search } = useReader()
  const { tab } = shell
  const list = useTemplateRef<ComponentPublicInstance>('list')

  const counted = (label: string, count: number) => (count ? `${label} ${count}` : label)

  watch(
    [tab, () => search.results.value.length],
    () =>
      void nextTick(() => {
        const root: unknown = list.value?.$el
        if (!(root instanceof Element)) return
        root
          .querySelector('[role="tab"][aria-selected="true"]')
          ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
      }),
    { flush: 'post' },
  )
</script>

<template>
  <Tabs v-model="tab" size="lg" class="flex min-h-0 flex-1 flex-col">
    <Flex class="shrink-0">
      <TabsList
        ref="list"
        label="导航"
        data-tour="navigation-tabs"
        class="min-w-0 flex-1 [&_[role=tablist]]:ps-1"
      >
        <TabsTrigger value="toc">目录</TabsTrigger>
        <TabsTrigger value="bookmarks">
          {{ counted('书签', bookmarks.entries.value.length) }}
        </TabsTrigger>
        <TabsTrigger value="highlights">
          {{ counted('高亮', highlights.entries.value.length) }}
        </TabsTrigger>
        <TabsTrigger value="search">
          {{ counted('搜索', search.results.value.length) }}
        </TabsTrigger>
      </TabsList>
      <Center v-if="standalone" class="shrink-0 border-b border-line pe-2">
        <CloseButton label="关闭导航" @click="emit('close')" />
      </Center>
    </Flex>
    <LightNovelReaderSearchQuery
      v-if="!standalone && tab === 'search'"
      class="mx-4 mt-3 mb-1 w-auto shrink-0"
    />
    <ScrollArea class="min-h-0 flex-1">
      <TabsContent value="toc"><LightNovelReaderTocPanel /></TabsContent>
      <TabsContent value="bookmarks"><LightNovelReaderBookmarkList /></TabsContent>
      <TabsContent value="highlights"><LightNovelReaderHighlightList /></TabsContent>
      <TabsContent value="search"><LightNovelReaderSearchResults /></TabsContent>
    </ScrollArea>
    <Inline
      v-if="tab === 'highlights' && highlights.entries.value.length"
      :wrap="false"
      class="min-h-17 shrink-0 border-t border-line px-4 py-3"
    >
      <LightNovelReaderHighlightFooter />
    </Inline>
  </Tabs>
</template>

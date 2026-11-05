<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hina-ui/vue'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'
  import { ENTRY_PAGE } from '~/features/wiki/editor/page'

  defineOptions({ name: 'WikiEditorSide' })

  defineProps<{
    entry: number
    type: string
    definitions: EntryDefinition[]
    base: string
  }>()
  const emit = defineEmits<{ changed: [] }>()
  const route = useRoute()
  const page = inject(ENTRY_PAGE)!
  const count = computed(() => page.hints.value.length)
  const nav = usePageNav()
  const side = computed(() =>
    route.query.side === 'hints' || route.query.side === 'refs' ? route.query.side : 'history',
  )

  function choose(value: string | undefined) {
    void nav.query({ side: !value || value === 'history' ? null : value }, 'replace')
  }
</script>

<template>
  <Tabs :model-value="side" variant="soft" size="sm" @update:model-value="choose">
    <TabsList label="修改记录、建议与相关条目">
      <TabsTrigger value="history">修改记录</TabsTrigger>
      <TabsTrigger value="hints">建议{{ count ? ` ${count}` : '' }}</TabsTrigger>
      <TabsTrigger value="refs">相关条目</TabsTrigger>
    </TabsList>
    <TabsContent value="history" class="pt-4">
      <WikiEditorSideHistory />
    </TabsContent>
    <TabsContent value="hints" class="pt-4">
      <WikiEditorSideHints :entry="entry" :base="base" @changed="emit('changed')" />
    </TabsContent>
    <TabsContent value="refs" class="pt-4">
      <WikiEditorSideRefs :type="type" :definitions="definitions" />
    </TabsContent>
  </Tabs>
</template>

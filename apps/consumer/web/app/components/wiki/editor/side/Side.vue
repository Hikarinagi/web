<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hina-ui/vue'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiEditorSide' })

  defineProps<{
    type: string
    definitions: EntryDefinition[]
  }>()
  const route = useRoute()
  const nav = usePageNav()
  const side = computed(() => (route.query.side === 'refs' ? 'refs' : 'history'))

  function choose(value: string | undefined) {
    void nav.query({ side: !value || value === 'history' ? null : value }, 'replace')
  }
</script>

<template>
  <Tabs :model-value="side" variant="soft" size="sm" @update:model-value="choose">
    <TabsList label="修改记录与相关条目">
      <TabsTrigger value="history">修改记录</TabsTrigger>
      <TabsTrigger value="refs">相关条目</TabsTrigger>
    </TabsList>
    <TabsContent value="history" class="pt-4">
      <WikiEditorSideHistory />
    </TabsContent>
    <TabsContent value="refs" class="pt-4">
      <WikiEditorSideRefs :type="type" :definitions="definitions" />
    </TabsContent>
  </Tabs>
</template>

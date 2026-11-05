<script setup lang="ts">
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '@hina-ui/vue'
  import type { EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiEditorSide' })

  const props = defineProps<{ entry: number; definitions: EntryDefinition[]; base: string }>()
  const emit = defineEmits<{ changed: [] }>()
  const route = useRoute()
  const hints = useEntryHints(props.entry)
  const count = computed(() => hints.data.value?.items.length ?? 0)
  const router = useRouter()
  const side = computed(() =>
    route.query.side === 'hints' || route.query.side === 'refs' ? route.query.side : 'history',
  )

  function choose(value: string | undefined) {
    const { side: _side, ...query } = route.query
    void router.replace({
      query: !value || value === 'history' ? query : { ...query, side: value },
    })
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
      <WikiEditorSideHistory :entry="entry" />
    </TabsContent>
    <TabsContent value="hints" class="pt-4">
      <WikiEditorSideHints :entry="entry" :base="base" @changed="emit('changed')" />
    </TabsContent>
    <TabsContent value="refs" class="pt-4">
      <WikiEditorSideRefs :entry="entry" :definitions="definitions" />
    </TabsContent>
  </Tabs>
</template>

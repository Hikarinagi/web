<script setup lang="ts">
  import { Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import type { GalgameEditPageData } from '~~/server/api/pages/create/edit/galgame/[id].get'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { ENTRY_TYPE_NAMES, type BackendStatement } from '~/features/creator/entry/contract'
  import { GAME_GROUPS } from '~/features/creator/entry/groups'

  defineOptions({ name: 'CreatorEntryEditor' })
  const props = defineProps<{ pageData: GalgameEditPageData }>()
  defineEmits<{ saved: [] }>()

  const tab = ref('facts')
  const merging = ref(false)
  const splitting = ref(false)
  const editing = ref<{ property: string; target: number | 'new' } | null>(null)
  const definitions = computed(
    () => props.pageData.definitions.find(item => item.type === 'GAME')?.properties ?? [],
  )
  provide(
    ENTRY_TYPE_NAMES,
    computed(() =>
      Object.fromEntries(props.pageData.definitions.map(item => [item.type, item.label])),
    ),
  )

  function fix(statement: BackendStatement) {
    tab.value = 'facts'
    editing.value = { property: statement.property, target: statement.id }
  }
  const { can } = useCreatorPermissions()
  const sample = computed(() => definitions.value.find(item => item.property === 'SAMPLE_IMAGE'))
  const images = computed(() =>
    props.pageData.entry.statements
      .filter(item => item.property === 'SAMPLE_IMAGE' && item.status !== 'DEPRECATED')
      .sort((a, b) => a.position - b.position || a.id - b.id),
  )
  const readonly = computed(
    () => props.pageData.entry.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const appearances = computed(() =>
    props.pageData.appearances.reduce((total, group) => total + group.total, 0),
  )
  const tabs = computed(() => [
    { value: 'facts', label: '资料', count: 0 },
    { value: 'products', label: '发行版本', count: props.pageData.products.length },
    { value: 'appearances', label: '出场角色', count: appearances.value },
    { value: 'images', label: '图片', count: images.value.length },
    { value: 'todos', label: '待完善', count: props.pageData.todos.meta.total_items },
    { value: 'history', label: '历史', count: 0 },
  ])
  const meta = computed(() => [
    ...props.pageData.display.brands.map(brand => brand.text),
    ...(props.pageData.display.release?.text ? [props.pageData.display.release.text] : []),
  ])
  const route = useRoute()
  onMounted(() => {
    const id = Number(route.query.fix)
    const statement = props.pageData.entry.statements.find(item => item.id === id)
    if (statement) fix(statement)
  })
</script>

<template>
  <Stack gap="lg">
    <CreatorEntryHeader
      :readonly="readonly"
      :title="pageData.display.original_title ?? pageData.display.title"
      type="游戏"
      :cover="pageData.galgame.cover"
      :to="`/galgames/${pageData.galgame.id}`"
      splittable
      @merge="merging = true"
      @split="splitting = true"
    >
      <Text v-for="item in meta" :key="item" as="span" size="sm" tone="muted" lang="ja">
        {{ item }}
      </Text>
    </CreatorEntryHeader>
    <CreatorEntryProtection :protection="pageData.entry.protection" />
    <Tabs v-model="tab">
      <TabsList aria-label="编辑内容">
        <TabsTrigger v-for="item in tabs" :key="item.value" :value="item.value">
          {{ item.label }}
          <Text v-if="item.count" as="span" size="sm" tone="muted" class="tabular-nums">
            {{ item.count }}
          </Text>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="facts" class="pt-6">
        <CreatorEntryFacts
          v-model:editing="editing"
          :entry="pageData.entry"
          :definitions="definitions"
          :groups="GAME_GROUPS"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="products" class="pt-6">
        <CreatorEntryProductsTab :page-data="pageData" />
      </TabsContent>
      <TabsContent value="appearances" class="pt-6">
        <CreatorEntryCastTab :groups="pageData.appearances" />
      </TabsContent>
      <TabsContent value="images" class="pt-6">
        <CreatorEntryImagesTab
          v-if="sample"
          :entry="pageData.entry"
          :definition="sample"
          :readonly="readonly"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="todos" class="pt-6">
        <CreatorEntryTodos
          :todos="pageData.todos"
          :entry="pageData.entry"
          :definitions="definitions"
          @fix="fix"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="history" class="pt-6">
        <CreatorEntryHistoryTab
          v-if="tab === 'history'"
          :entry-id="pageData.galgame.entry_id"
          :definitions="definitions"
          :source="`/api/pages/create/edit/galgame/${pageData.galgame.id}/history`"
          :revision-to="revision => `/galgames/${pageData.galgame.id}/revisions/${revision}`"
        />
      </TabsContent>
    </Tabs>
    <CreatorEntryMergeDialog
      v-model:open="merging"
      :entry="pageData.entry"
      :definitions="definitions"
    />
    <CreatorEntrySplitDialog
      v-model:open="splitting"
      :entry="pageData.entry"
      :definitions="definitions"
      :children="pageData.links"
    />
  </Stack>
</template>

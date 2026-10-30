<script setup lang="ts">
  import { Empty, Flex, Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
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
  const retired = computed(() =>
    props.pageData.entry.statements.filter(
      item => item.property === 'SAMPLE_IMAGE' && item.status === 'DEPRECATED',
    ),
  )
  const readonly = computed(
    () => props.pageData.entry.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const appearances = computed(() =>
    props.pageData.appearances.reduce((total, group) => total + group.total, 0),
  )
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
      :title="pageData.display.original_title ?? pageData.display.title"
      type="游戏"
      :meta="meta"
      :to="`/galgames/${pageData.galgame.id}`"
      :history-to="`/create/edit/galgame/${pageData.galgame.id}/history`"
      splittable
      @merge="merging = true"
      @split="splitting = true"
    />
    <Flex direction="col" gap="lg" class="lg:flex-row lg:items-start">
      <Tabs v-model="tab" class="min-w-0 flex-1">
        <TabsList aria-label="编辑内容">
          <TabsTrigger value="facts">资料</TabsTrigger>
          <TabsTrigger value="products">
            发行版本
            <Text as="span" size="sm" tone="muted" class="tabular-nums">
              {{ pageData.products.length }}
            </Text>
          </TabsTrigger>
          <TabsTrigger value="images">
            图片
            <Text as="span" size="sm" tone="muted" class="tabular-nums">
              {{ images.length }}
            </Text>
          </TabsTrigger>
          <TabsTrigger value="appearances">
            出场角色
            <Text as="span" size="sm" tone="muted" class="tabular-nums">
              {{ appearances }}
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
          <CreatorEntryProducts :products="pageData.products" />
        </TabsContent>
        <TabsContent value="images" class="pt-6">
          <Panel v-if="sample" :title="sample.label" :count="images.length">
            <CreatorEntryImagesGallery
              :entry="pageData.entry"
              :definition="sample"
              :statements="images"
              :deprecated="retired"
              :readonly="readonly"
              @saved="$emit('saved')"
            />
          </Panel>
        </TabsContent>
        <TabsContent value="appearances" class="pt-6">
          <Stack gap="lg">
            <CreatorEntryReferences
              :groups="pageData.appearances"
              :definitions="pageData.definitions"
            />
            <Empty v-if="!appearances" title="尚无出场角色" />
          </Stack>
        </TabsContent>
      </Tabs>
      <Stack gap="lg" class="lg:w-80 lg:shrink-0">
        <CreatorEntryTodos
          :todos="pageData.todos"
          :entry="pageData.entry"
          :definitions="definitions"
          @fix="fix"
          @saved="$emit('saved')"
        />
        <CreatorEntryRecent
          :rows="pageData.history.items"
          :history-to="`/create/edit/galgame/${pageData.galgame.id}/history`"
          :revision-to="revision => `/galgames/${pageData.galgame.id}/revisions/${revision}`"
        />
      </Stack>
    </Flex>
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

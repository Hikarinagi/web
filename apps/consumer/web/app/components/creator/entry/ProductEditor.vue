<script setup lang="ts">
  import { Link, Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ProductEditPageData } from '~~/server/api/pages/create/edit/product/[id].get'
  import { titleText } from '~/features/entry/labels'
  import { ENTRY_TYPE_NAMES, type BackendStatement } from '~/features/creator/entry/contract'
  import { PRODUCT_GROUPS } from '~/features/creator/entry/groups'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'

  defineOptions({ name: 'CreatorEntryProductEditor' })
  const props = defineProps<{ pageData: ProductEditPageData }>()
  defineEmits<{ saved: [] }>()

  const definitions = computed(
    () => props.pageData.definitions.find(item => item.type === 'PRODUCT')?.properties ?? [],
  )
  provide(
    ENTRY_TYPE_NAMES,
    computed(() =>
      Object.fromEntries(props.pageData.definitions.map(item => [item.type, item.label])),
    ),
  )
  const game = computed(() => props.pageData.product.games[0] ?? null)
  const route = useRoute()
  const tab = ref(route.query.tab === 'credits' ? 'credits' : 'facts')
  const credit = computed(() => definitions.value.find(item => item.property === 'CREDIT'))
  const credits = computed(
    () =>
      props.pageData.entry.statements.filter(
        item => item.property === 'CREDIT' && item.status !== 'DEPRECATED',
      ).length,
  )
  const crediting = ref<number | 'new' | null>(null)
  const { can } = useCreatorPermissions()
  const readonly = computed(
    () => props.pageData.entry.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const merging = ref(false)
  const splitting = ref(false)
  const editing = ref<{ property: string; target: number | 'new' } | null>(null)
  const fix = (statement: BackendStatement) => {
    if (statement.property === 'CREDIT') {
      tab.value = 'credits'
      crediting.value = statement.id
      return
    }
    tab.value = 'facts'
    editing.value = { property: statement.property, target: statement.id }
  }
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
      :title="titleText(pageData.product.title)"
      type="发行版本"
      :cover="pageData.product.cover"
      :to="game ? `/galgames/${game.id}?product=${pageData.product.id}` : null"
      splittable
      @merge="merging = true"
      @split="splitting = true"
    >
      <Text v-if="pageData.product.games.length" as="span" size="sm" tone="muted">
        收录的游戏：<template v-for="(item, index) in pageData.product.games" :key="item.id"
          ><template v-if="index">、</template
          ><Link :as="NuxtLink" :to="`/create/edit/galgame/${item.id}`" tone="accent" lang="ja">{{
            item.title
          }}</Link></template
        >
      </Text>
      <Text v-if="pageData.product.release?.text" as="span" size="sm" tone="muted">
        {{ pageData.product.release.text }}
      </Text>
    </CreatorEntryHeader>
    <CreatorEntryProtection :protection="pageData.entry.protection" />
    <Tabs v-model="tab">
      <TabsList aria-label="编辑内容">
        <TabsTrigger value="facts">资料</TabsTrigger>
        <TabsTrigger value="credits">
          制作信息
          <Text v-if="credits" as="span" size="sm" tone="muted" class="tabular-nums">
            {{ credits }}
          </Text>
        </TabsTrigger>
        <TabsTrigger value="todos">
          待完善
          <Text
            v-if="pageData.todos.meta.total_items"
            as="span"
            size="sm"
            tone="muted"
            class="tabular-nums"
          >
            {{ pageData.todos.meta.total_items }}
          </Text>
        </TabsTrigger>
        <TabsTrigger value="history">历史</TabsTrigger>
      </TabsList>
      <TabsContent value="facts" class="pt-6">
        <CreatorEntryFacts
          v-model:editing="editing"
          :entry="pageData.entry"
          :definitions="definitions"
          :groups="PRODUCT_GROUPS"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="credits" class="pt-6">
        <CreatorEntryCreditsTab
          v-if="credit"
          v-model:editing="crediting"
          :entry="pageData.entry"
          :definition="credit"
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
          :entry-id="pageData.entry.id"
          :definitions="definitions"
          :source="`/api/pages/create/edit/entry/${pageData.entry.id}/history`"
          :revision-to="
            revision =>
              revision > 1
                ? `/create/edit/entry/${pageData.entry.id}/compare?from=${revision - 1}&to=${revision}`
                : null
          "
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
      :children="null"
    />
  </Stack>
</template>

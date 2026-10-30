<script setup lang="ts">
  import {
    Button,
    Heading,
    Inline,
    Link,
    Stack,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ProductEditPageData } from '~~/server/api/pages/create/edit/product/[id].get'
  import { titleText, versionKindLabel } from '~/features/entry/labels'
  import { ENTRY_TYPE_NAMES, type BackendStatement } from '~/features/creator/entry/contract'
  import { PRODUCT_GROUPS } from '~/features/creator/entry/groups'

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
  const tab = ref('facts')
  const editing = ref<{ property: string; target: number | 'new' } | null>(null)
  const fix = (statement: BackendStatement) => {
    tab.value = 'facts'
    editing.value = { property: statement.property, target: statement.id }
  }
  const route = useRoute()
  onMounted(() => {
    const id = Number(route.query.fix)
    const statement = props.pageData.entry.statements.find(item => item.id === id)
    if (statement) fix(statement)
  })
</script>

<template>
  <Stack gap="lg">
    <Inline gap="md" align="start" justify="between" wrap>
      <Stack gap="xs" class="min-w-0">
        <Heading :level="2" size="xl" lang="ja">{{ titleText(pageData.product.title) }}</Heading>
        <Inline gap="sm" align="center">
          <Tag tone="neutral">发行版本</Tag>
          <Tag v-if="pageData.product.kind" tone="neutral" variant="outline">
            {{ versionKindLabel(pageData.product.kind) }}
          </Tag>
          <Text as="span" size="sm" tone="muted">
            收录的游戏：
            <template v-for="(item, index) in pageData.product.games" :key="item.id">
              <Text v-if="index" as="span">、</Text>
              <Link :as="NuxtLink" :to="`/create/edit/galgame/${item.id}`" tone="accent">
                {{ item.title }}
              </Link>
            </template>
          </Text>
        </Inline>
      </Stack>
      <Button
        v-if="game"
        :as="NuxtLink"
        :to="`/create/edit/galgame/${game.id}`"
        variant="outline"
        tone="neutral"
        size="sm"
      >
        <template #icon><ArrowLeft /></template>
        返回游戏
      </Button>
    </Inline>
    <Tabs v-model="tab">
      <TabsList aria-label="编辑内容">
        <TabsTrigger value="facts">资料</TabsTrigger>
        <TabsTrigger value="todos">
          待完善
          <Text as="span" size="sm" tone="muted" class="tabular-nums">
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
          :source="`/api/pages/create/edit/entry/${pageData.entry.id}/history`"
          :revision-to="
            revision =>
              revision > 1
                ? `/create/edit/entry/${pageData.entry.id}/compare?from=${revision - 1}&to=${revision}`
                : null
          "
          :compare-to="
            (from, to) => `/create/edit/entry/${pageData.entry.id}/compare?from=${from}&to=${to}`
          "
        />
      </TabsContent>
    </Tabs>
  </Stack>
</template>

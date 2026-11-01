<script setup lang="ts">
  import { Link, Stack, Tabs, TabsContent, TabsList, TabsTrigger, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { EntryEditPageData } from '~~/server/api/pages/create/edit/entry/[id].get'
  import {
    ENTRY_TYPE_NAMES,
    ENTRY_VERSIONS,
    type BackendStatement,
  } from '~/features/creator/entry/contract'
  import { ENTRY_GROUPS } from '~/features/creator/entry/groups'

  defineOptions({ name: 'CreatorEntryStandardEditor' })
  const props = defineProps<{ pageData: NonNullable<EntryEditPageData['editor']> }>()
  defineEmits<{ saved: [] }>()

  const entry = computed(() => props.pageData.entry)
  const owner = computed(() =>
    props.pageData.definitions.find(item => item.type === entry.value.type),
  )
  const definitions = computed(() => owner.value?.properties ?? [])
  provide(
    ENTRY_TYPE_NAMES,
    computed(() =>
      Object.fromEntries(props.pageData.definitions.map(item => [item.type, item.label])),
    ),
  )
  provide(
    ENTRY_VERSIONS,
    computed(() => props.pageData.versions),
  )
  const merging = ref(false)
  const splitting = ref(false)
  const moving = ref(false)
  const children = computed(
    () =>
      props.pageData.references.find(
        group =>
          (group.type === 'VOLUME' && group.property === 'SERIES') ||
          (group.type === 'PRODUCT' && group.property === 'INCLUDED_GAME'),
      ) ?? null,
  )
  const placement = computed(() =>
    entry.value.type === 'VOLUME'
      ? (entry.value.statements.find(
          item => item.property === 'SERIES' && item.status !== 'DEPRECATED',
        ) ?? null)
      : null,
  )
  const live = (property: string) =>
    entry.value.statements
      .filter(item => item.property === property && item.status !== 'DEPRECATED')
      .sort((a, b) => a.position - b.position || a.id - b.id)
  const cover = computed(
    () => [...live('COVER'), ...live('IMAGE')].find(item => item.media)?.media ?? null,
  )
  const owners = computed(() =>
    entry.value.type === 'APPEARANCE'
      ? [
          { label: '作品', target: live('WORK')[0]?.target },
          { label: '角色', target: live('CHARACTER')[0]?.target },
        ].filter(item => item.target)
      : [],
  )
  const gallery = computed(() =>
    entry.value.type === 'APPEARANCE'
      ? definitions.value.find(item => item.property === 'IMAGE')
      : undefined,
  )
  const { can } = useCreatorPermissions()
  const readonly = computed(
    () => entry.value.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const tabs = computed(() => [
    { value: 'facts', label: '资料', count: 0 },
    ...(gallery.value ? [{ value: 'images', label: '图片', count: live('IMAGE').length }] : []),
    { value: 'todos', label: '待完善', count: props.pageData.todos.meta.total_items },
    { value: 'history', label: '历史', count: 0 },
  ])
  const seriesDefinition = computed(() =>
    definitions.value.find(item => item.property === 'SERIES'),
  )
  const tab = ref('facts')
  const editing = ref<{ property: string; target: number | 'new' } | null>(null)
  const fix = (statement: BackendStatement) => {
    tab.value = 'facts'
    editing.value = { property: statement.property, target: statement.id }
  }
  const route = useRoute()
  onMounted(() => {
    const id = Number(route.query.fix)
    const statement = entry.value.statements.find(item => item.id === id)
    if (statement) fix(statement)
  })
</script>

<template>
  <Stack gap="lg">
    <CreatorEntryHeader
      :readonly="readonly"
      :title="entry.label"
      :type="owner?.label ?? ''"
      :cover="cover"
      :portrait="entry.type === 'APPEARANCE'"
      :to="pageData.reader"
      :splittable="entry.type !== 'CHARACTER'"
      :movable="Boolean(placement)"
      @merge="merging = true"
      @split="splitting = true"
      @move="moving = true"
    >
      <Text v-for="item in owners" :key="item.label" as="span" size="sm" tone="muted">
        {{ item.label }}：<Link
          :as="NuxtLink"
          :to="`/create/edit/entry/${item.target?.id}`"
          tone="accent"
          lang="ja"
          >{{ item.target?.label }}</Link
        >
      </Text>
    </CreatorEntryHeader>
    <CreatorEntryProtection :protection="entry.protection" />
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
        <Stack gap="lg">
          <CreatorEntryFacts
            v-model:editing="editing"
            :entry="entry"
            :definitions="definitions"
            :groups="ENTRY_GROUPS[entry.type] ?? []"
            @saved="$emit('saved')"
          />
          <CreatorEntryReferences
            :groups="pageData.references"
            :definitions="pageData.definitions"
          />
        </Stack>
      </TabsContent>
      <TabsContent v-if="gallery" value="images" class="pt-6">
        <CreatorEntryImagesTab
          :entry="entry"
          :definition="gallery"
          :readonly="readonly"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="todos" class="pt-6">
        <CreatorEntryTodos
          :todos="pageData.todos"
          :entry="entry"
          :definitions="definitions"
          @fix="fix"
          @saved="$emit('saved')"
        />
      </TabsContent>
      <TabsContent value="history" class="pt-6">
        <CreatorEntryHistoryTab
          v-if="tab === 'history'"
          :entry-id="entry.id"
          :definitions="definitions"
          :source="`/api/pages/create/edit/entry/${entry.id}/history`"
          :revision-to="
            revision =>
              revision > 1
                ? `/create/edit/entry/${entry.id}/compare?from=${revision - 1}&to=${revision}`
                : null
          "
        />
      </TabsContent>
    </Tabs>
    <CreatorEntryMergeDialog v-model:open="merging" :entry="entry" :definitions="definitions" />
    <CreatorEntrySplitDialog
      v-model:open="splitting"
      :entry="entry"
      :definitions="definitions"
      :children="children"
    />
    <CreatorEntryMoveDialog
      v-if="placement && seriesDefinition"
      v-model:open="moving"
      :entry="entry"
      :definition="seriesDefinition"
      :statement="placement"
      @saved="$emit('saved')"
    />
  </Stack>
</template>

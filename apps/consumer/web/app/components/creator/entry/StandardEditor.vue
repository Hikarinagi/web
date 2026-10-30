<script setup lang="ts">
  import { Flex, Stack } from '@hina-ui/vue'
  import type { EntryEditPageData } from '~~/server/api/pages/create/edit/entry/[id].get'
  import {
    ENTRY_TYPE_NAMES,
    ENTRY_VERSIONS,
    type BackendStatement,
  } from '~/features/creator/entry/contract'
  import { ENTRY_GROUPS } from '~/features/creator/entry/groups'
  import { readerPath } from '~/features/creator/entry/references'

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
  const seriesDefinition = computed(() =>
    definitions.value.find(item => item.property === 'SERIES'),
  )
  const editing = ref<{ property: string; target: number | 'new' } | null>(null)
  const fix = (statement: BackendStatement) => {
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
      :title="entry.label"
      :type="owner?.label ?? ''"
      :meta="[]"
      :to="readerPath(entry.resource)"
      :history-to="`/create/edit/entry/${entry.id}/history`"
      :splittable="entry.type !== 'CHARACTER'"
      :movable="Boolean(placement)"
      @merge="merging = true"
      @split="splitting = true"
      @move="moving = true"
    />
    <Flex direction="col" gap="lg" class="lg:flex-row lg:items-start">
      <Stack gap="lg" class="min-w-0 flex-1">
        <CreatorEntryFacts
          v-model:editing="editing"
          :entry="entry"
          :definitions="definitions"
          :groups="ENTRY_GROUPS[entry.type] ?? []"
          @saved="$emit('saved')"
        />
        <CreatorEntryReferences :groups="pageData.references" :definitions="pageData.definitions" />
      </Stack>
      <Stack gap="lg" class="lg:w-80 lg:shrink-0">
        <CreatorEntryTodos
          :todos="pageData.todos"
          :entry="entry"
          :definitions="definitions"
          @fix="fix"
          @saved="$emit('saved')"
        />
        <CreatorEntryRecent
          :rows="pageData.history.items"
          :history-to="`/create/edit/entry/${entry.id}/history`"
          :revision-to="
            revision =>
              revision > 1
                ? `/create/edit/entry/${entry.id}/compare?from=${revision - 1}&to=${revision}`
                : null
          "
        />
      </Stack>
    </Flex>
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

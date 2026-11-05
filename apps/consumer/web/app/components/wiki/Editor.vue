<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { tabKey } from '~/features/creator/tabs'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry, EntryDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import { changedParts } from '~/features/wiki/editor/parts'
  import { editorPath, partsOf } from '~/features/wiki/editor/route'

  defineOptions({ name: 'WikiEditor' })

  type Ref = NonNullable<ValueDraft['target']>

  const props = defineProps<{
    entry: EditableEntry
    parts: EditableEntry[]
    owner: Ref | null
    versions: Ref[]
    definitions: EntryDefinition[]
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const route = useRoute()
  const editor = useEntryEditor({
    key: () => tabKey(route.path),
    title: () => props.entry.label || '未命名',
    entries: () => [props.entry, ...props.parts],
    definitions: () => props.definitions,
    versions: () => props.versions,
    root: props.entry.id,
  })
  provide(ENTRY_EDITOR, editor)

  const segments = computed(() => {
    const path = route.params.path
    return Array.isArray(path) ? path : path ? [path] : []
  })
  const path = computed(() => editorPath(props.entry.type, segments.value))
  const tabs = computed(() => partsOf(props.entry.type))
  const typeOf = (id: number) =>
    editor.entries.value.get(id)?.type ??
    editor.draft.value.created.find(entry => entry.id === id)?.type
  const changes = computed(() =>
    changedParts(props.entry.type, editor.draft.value, editor.statements.value, typeOf),
  )
  const count = (type: EditableEntry['type']) =>
    props.parts.filter(item => item.type === type).length +
    editor.draft.value.created.filter(item => item.type === type).length
  const totals = computed(() => ({
    releases: count('PRODUCT'),
    cast: count('APPEARANCE'),
    volumes: count('VOLUME'),
  }))
  const base = computed(() => {
    const rest = path.value.segments
    return `/entries/${props.entry.id}/edit${rest.length ? `/${rest.join('/')}` : ''}`
  })
  const { canAny } = useCreatorPermissions()
  const readonly = computed(
    () =>
      props.entry.deleted || (Boolean(props.entry.protection) && !canAny(WIKI_PERMISSIONS.PATROL)),
  )
  const previewing = computed(
    () => path.value.panel === 'preview' && props.entry.resource?.kind === 'galgame',
  )
  const definition = computed(() => editor.definitions.value.get(props.entry.type))
  const image = computed(
    () =>
      props.entry.statements.find(
        item =>
          (item.property === 'COVER' || item.property === 'IMAGE') &&
          item.status !== 'DEPRECATED' &&
          item.media,
      )?.media ?? null,
  )

  useEventListener('beforeunload', event => {
    if (editor.count.value) event.preventDefault()
  })
  const recent = useWikiRecentStore()
  onMounted(() =>
    recent.visit({
      id: props.entry.id,
      type: props.entry.type,
      label: props.entry.label,
      image: image.value,
    }),
  )
</script>

<template>
  <WikiEditorPreview v-if="previewing" :galgame="entry.resource!.id" :base="base" />
  <WikiEditorFrame v-else>
    <template #header>
      <WikiEditorHeader
        :entry="entry"
        :type="definition?.label ?? ''"
        :owner="owner"
        :image="image"
      />
    </template>
    <template v-if="tabs.length && path.part" #tabs>
      <WikiEditorParts
        :entry="entry.id"
        :parts="tabs"
        :current="path.part"
        :changes="changes"
        :totals="totals"
      />
    </template>
    <WikiEditorPanels
      :entry="entry"
      :panel="path.panel"
      :suggestion="path.suggestion"
      :base="base"
      @changed="emit('saved')"
    />
    <Stack gap="lg" :inert="readonly || undefined">
      <WikiEditorBody v-if="definition" :entry="entry" :definition="definition" :path="path" />
    </Stack>
    <template #side>
      <WikiEditorSide
        :entry="entry.id"
        :definitions="definitions"
        :base="base"
        @changed="emit('saved')"
      />
    </template>
    <template v-if="!readonly" #footer><WikiEditorSaveBar /></template>
  </WikiEditorFrame>
  <WikiSaveDrawer @saved="emit('saved')" />
</template>

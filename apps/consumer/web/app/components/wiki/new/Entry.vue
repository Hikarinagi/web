<script setup lang="ts">
  import { Button, Inline, Stack } from '@hina-ui/vue'
  import { tabKey } from '~/features/creator/tabs'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditResult } from '~/features/wiki/composables/useSaveFlow'
  import { emptyValue, type EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiNewEntry' })

  const props = defineProps<{ definitions: EntryDefinition[] }>()
  const route = useRoute()
  const editor = useEntryEditor({
    key: () => tabKey(route.path),
    title: () => '新建条目',
    entries: () => [],
    definitions: () => props.definitions,
  })
  provide(ENTRY_EDITOR, editor)

  const created = computed(
    () => editor.draft.value.created.find(item => item.type !== 'CHARACTER') ?? null,
  )
  const definition = computed(() =>
    created.value ? editor.definitions.value.get(created.value.type) : undefined,
  )

  function create(type: 'GAME' | 'SERIES' | 'PERSON' | 'ORGANIZATION', name: string) {
    const id = editor.create(type)
    if (name)
      editor.add(id, type === 'GAME' || type === 'SERIES' ? 'TITLE' : 'NAME', {
        ...emptyValue(),
        text: name,
      })
  }

  async function saved(result?: EditResult) {
    const id = result ? Math.max(...result.entries) : null
    if (id) await navigateTo(`/entries/${id}/edit`)
  }
</script>

<template>
  <Stack v-if="created && definition" gap="lg">
    <Inline justify="end">
      <Button variant="ghost" tone="neutral" size="sm" @click="editor.discard()">重新查找</Button>
    </Inline>
    <WikiEditorForm :entry="created" :definition="definition" />
    <WikiEditorSaveBar />
  </Stack>
  <WikiNewLookup v-else @create="create" />
  <WikiSaveDrawer @saved="saved" />
</template>

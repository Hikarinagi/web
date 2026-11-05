<script setup lang="ts">
  import { Button, Page, PageBody, ScrollArea, Stack } from '@hina-ui/vue'
  import { resourceKey } from '~/features/creator/tabs'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditResult } from '~/features/wiki/composables/useSaveFlow'
  import { emptyValue, type EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiNewEntry' })

  const props = defineProps<{ definitions: EntryDefinition[] }>()
  const route = useRoute()
  const { typeName } = useWikiDefinitions()
  const editor = useEntryEditor({
    key: () => resourceKey(route.path),
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
  <Stack gap="none" class="h-full min-h-0">
    <ScrollArea class="min-h-0 flex-1">
      <Page :size="created && definition ? 'lg' : 'md'" class="max-md:py-4">
        <WikiPageHead :title="created ? `新建${typeName(created.type)}` : '新建条目'">
          <template v-if="created" #actions>
            <Button variant="outline" tone="neutral" size="sm" @click="editor.discard()">
              重新查找
            </Button>
          </template>
        </WikiPageHead>
        <PageBody>
          <WikiEditorForm v-if="created && definition" :entry="created" :definition="definition" />
          <WikiNewLookup v-else @create="create" />
        </PageBody>
      </Page>
    </ScrollArea>
    <WikiEditorSaveBar v-if="created && definition" />
  </Stack>
  <WikiSaveDrawer @saved="saved" />
</template>

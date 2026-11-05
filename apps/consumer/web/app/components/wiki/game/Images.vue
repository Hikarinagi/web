<script setup lang="ts">
  import { Panel, Stack } from '@hina-ui/vue'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiGameImages' })

  const props = defineProps<{ game: EditableEntry }>()
  const editor = inject(ENTRY_EDITOR)!
  const parts = useEditorParts(editor, () => ({
    id: props.game.id,
    type: props.game.type,
    label: props.game.label,
  }))
  const cover = computed(() =>
    editor.definitions.value.get('PRODUCT')?.properties.find(item => item.property === 'COVER'),
  )
  const samples = computed(() =>
    editor.definitions.value.get('GAME')?.properties.find(item => item.property === 'SAMPLE_IMAGE'),
  )
</script>

<template>
  <Panel v-if="cover" title="各发行版本的封面">
    <Stack gap="lg">
      <Stack v-for="release in parts.entriesOf('PRODUCT')" :key="release.id" gap="sm">
        <WikiFieldProperty
          :entry="release.id"
          :definition="{
            ...cover,
            label: parts.first(release.id, 'TITLE')?.text || '未命名的发行版本',
          }"
        />
      </Stack>
    </Stack>
  </Panel>
  <Panel v-if="samples" :title="samples.label">
    <WikiFieldProperty :entry="game.id" :definition="samples" />
  </Panel>
</template>

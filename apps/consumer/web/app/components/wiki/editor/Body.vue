<script setup lang="ts">
  import { Panel } from '@hina-ui/vue'
  import type { EditableEntry, EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiEditorBody' })

  const props = defineProps<{
    entry: EditableEntry
    definition: EntryDefinition
    path: { part: string | null; selection: number[] }
  }>()
  const credit = computed(() =>
    props.definition.properties.find(item => item.property === 'CREDIT'),
  )
  const others = 'after:介绍与资料'
</script>

<template>
  <template v-if="entry.type === 'GAME'">
    <WikiGameReleases
      v-if="path.part === 'releases'"
      :game="entry"
      :selected="path.selection[0] ?? null"
    />
    <WikiWorkCast v-else-if="path.part === 'cast'" :work="entry" />
    <WikiWorkRelations v-else-if="path.part === 'relations'" :work="entry" />
    <WikiGameImages v-else-if="path.part === 'images'" :game="entry" />
    <WikiEditorForm v-else :entry="entry" :definition="definition" />
  </template>
  <template v-else-if="entry.type === 'SERIES'">
    <WikiSeriesVolumes
      v-if="path.part === 'volumes'"
      :series="entry"
      :volume="path.selection[0] ?? null"
      :book="path.selection[1] ?? null"
    />
    <Panel v-else-if="path.part === 'credits' && credit" title="作者与制作信息">
      <WikiFieldProperty :entry="entry.id" :definition="credit" />
    </Panel>
    <WikiWorkCast v-else-if="path.part === 'cast'" :work="entry" />
    <WikiWorkRelations v-else-if="path.part === 'relations'" :work="entry" />
    <WikiEditorForm v-else :entry="entry" :definition="definition" />
  </template>
  <WikiEditorForm v-else :entry="entry" :definition="definition">
    <template v-if="entry.type === 'APPEARANCE'" #[others]>
      <WikiAppearanceOthers :appearance="entry.id" />
    </template>
  </WikiEditorForm>
</template>

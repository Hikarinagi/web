<script setup lang="ts">
  import { Panel } from '@hina-ui/vue'
  import type { EditableEntry, EntryDefinition } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiEditorBody' })

  const props = defineProps<{
    entry: EditableEntry
    definition: EntryDefinition
    path: { part: string | null; selection: number[] }
    base: string
  }>()
  const credit = computed(() =>
    props.definition.properties.find(item => item.property === 'CREDIT'),
  )
  const others = 'after:图片'
  const basic = 'after:基本资料'
  const LINKS = [
    { title: '从属', noun: '组织', property: 'PARENT', side: 'held', panel: 'parent' },
    { title: '下属组织', noun: '组织', property: 'PARENT', side: 'given', panel: 'child' },
    { title: '成员', noun: '人物', property: 'MEMBER', side: 'held', panel: 'member' },
  ] as const
</script>

<template>
  <template v-if="entry.type === 'GAME'">
    <WikiGameReleases
      v-if="path.part === 'releases'"
      :game="entry"
      :selected="path.selection[0] ?? null"
    />
    <WikiWorkCast v-else-if="path.part === 'cast'" :work="entry" />
    <WikiWorkRelations v-else-if="path.part === 'relations'" :work="entry" :base="base" />
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
      <template v-if="credit.clauses.length" #actions>
        <WikiFieldRule label="作者与制作信息" :clauses="credit.clauses" />
      </template>
      <WikiFieldProperty bare :entry="entry.id" :definition="credit" />
    </Panel>
    <WikiWorkCast v-else-if="path.part === 'cast'" :work="entry" />
    <WikiWorkRelations v-else-if="path.part === 'relations'" :work="entry" :base="base" />
    <WikiEditorForm v-else :entry="entry" :definition="definition" />
  </template>
  <WikiEditorForm v-else :entry="entry" :definition="definition">
    <template v-if="entry.type === 'APPEARANCE'" #[others]>
      <WikiAppearanceOthers :appearance="entry.id" :base="base" />
    </template>
    <template v-else-if="entry.type === 'ORGANIZATION'" #[basic]>
      <WikiOrganizationLinks
        v-for="link in LINKS"
        :key="link.panel"
        :entry="entry"
        :title="link.title"
        :noun="link.noun"
        :property="link.property"
        :side="link.side"
        :panel="link.panel"
        :base="base"
      />
    </template>
  </WikiEditorForm>
</template>

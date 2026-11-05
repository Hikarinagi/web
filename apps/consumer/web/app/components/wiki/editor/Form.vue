<script setup lang="ts">
  import { FormLayout, Panel } from '@hina-ui/vue'
  import type { EditableEntry, EntryDefinition } from '~/features/wiki/editor/draft'
  import {
    FIELD_LABELS,
    groupsOf,
    PANEL_PROPERTIES,
    WIDE_PROPERTIES,
    type PropertyGroup,
  } from '~/features/wiki/editor/layout'
  import { ELSEWHERE } from '~/features/wiki/editor/parts'

  defineOptions({ name: 'WikiEditorForm' })

  const props = defineProps<{
    entry: Pick<EditableEntry, 'id' | 'type'>
    definition: EntryDefinition
    columns?: 2
  }>()

  const properties = computed(
    () => new Map(props.definition.properties.map(item => [item.property, item])),
  )
  const groups = computed(() =>
    groupsOf(
      props.entry.type,
      props.definition.properties.map(item => item.property),
      ELSEWHERE[props.entry.type],
    ),
  )
  const panel = (group: PropertyGroup) => {
    const property = group.properties[0]!
    return group.properties.length === 1 &&
      PANEL_PROPERTIES.includes(property) &&
      !FIELD_LABELS[props.entry.type]?.[property]
      ? properties.value.get(property)
      : undefined
  }
</script>

<template>
  <template v-for="group in groups" :key="group.title">
    <Panel v-if="panel(group)" :title="group.title">
      <template v-if="panel(group)!.clauses.length" #actions>
        <WikiFieldRule :label="group.title" :clauses="panel(group)!.clauses" />
      </template>
      <WikiFieldProperty bare :entry="entry.id" :definition="panel(group)!" />
    </Panel>
    <Panel v-else :title="group.title">
      <FormLayout
        :columns="columns ?? 1"
        :orientation="columns ? 'vertical' : 'responsive'"
        label-width="8rem"
      >
        <WikiFieldProperty
          v-for="property in group.properties"
          :key="property"
          :entry="entry.id"
          :definition="properties.get(property)!"
          :label="FIELD_LABELS[entry.type]?.[property]"
          :class="columns && WIDE_PROPERTIES.includes(property) ? 'sm:col-span-2' : undefined"
        />
      </FormLayout>
    </Panel>
    <slot :name="`after:${group.title}`" />
  </template>
</template>

<script setup lang="ts">
  import { Panel, Stack } from '@hina-ui/vue'
  import type { EditableEntry, EntryDefinition } from '~/features/wiki/editor/draft'
  import { groupsOf } from '~/features/wiki/editor/layout'
  import { ELSEWHERE } from '~/features/wiki/editor/parts'

  defineOptions({ name: 'WikiEditorForm' })

  const props = defineProps<{
    entry: Pick<EditableEntry, 'id' | 'type'>
    definition: EntryDefinition
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
</script>

<template>
  <template v-for="group in groups" :key="group.title">
    <Panel :title="group.title">
      <Stack gap="lg">
        <WikiFieldProperty
          v-for="property in group.properties"
          :key="property"
          :entry="entry.id"
          :definition="properties.get(property)!"
        />
      </Stack>
    </Panel>
    <slot :name="`after:${group.title}`" />
  </template>
</template>

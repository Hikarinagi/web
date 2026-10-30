<script setup lang="ts">
  import { DescriptionList, Panel, Stack } from '@hina-ui/vue'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { useMediaQuery } from '@vueuse/core'
  import type { PropertyGroup } from '~/features/creator/entry/groups'

  defineOptions({ name: 'CreatorEntryFacts' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
    groups: PropertyGroup[]
  }>()
  defineEmits<{ saved: [] }>()

  const { can } = useCreatorPermissions()
  const readonly = computed(
    () => props.entry.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const mounted = useMounted()
  const narrow = useMediaQuery('(max-width: 767px)')
  const orientation = computed(() => (mounted.value && narrow.value ? 'vertical' : 'horizontal'))
  const editing = defineModel<{ property: string; target: number | 'new' } | null>('editing', {
    default: null,
  })
  const definition = (property: string) =>
    props.definitions.find(item => item.property === property)
  const live = (property: string) =>
    props.entry.statements
      .filter(item => item.property === property && item.status !== 'DEPRECATED')
      .sort((a, b) => a.position - b.position || a.id - b.id)
  const deprecated = (property: string) =>
    props.entry.statements.filter(
      item => item.property === property && item.status === 'DEPRECATED',
    )
</script>

<template>
  <Stack gap="lg">
    <CreatorEntryProtection :protection="entry.protection" />
    <Panel v-for="group in groups" :key="group.title" :title="group.title">
      <DescriptionList :orientation="orientation" class="text-sm">
        <template v-for="property in group.properties" :key="property">
          <CreatorEntryRow
            v-if="definition(property)"
            :entry="entry"
            :definition="definition(property)!"
            :statements="live(property)"
            :deprecated="deprecated(property)"
            :readonly="readonly"
            :editing="editing?.property === property ? editing.target : null"
            @edit="target => (editing = target === null ? null : { property, target })"
            @saved="$emit('saved')"
          />
        </template>
      </DescriptionList>
    </Panel>
  </Stack>
</template>

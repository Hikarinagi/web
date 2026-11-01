<script setup lang="ts">
  import {
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Panel,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import {
    ENTRY_PROPERTIES,
    type BackendEditableEntry,
    type BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import { useMediaQuery } from '@vueuse/core'
  import type { PropertyGroup } from '~/features/creator/entry/groups'
  import { codeLabel } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFacts' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
    groups: PropertyGroup[]
  }>()
  defineEmits<{ saved: [] }>()

  provide(
    ENTRY_PROPERTIES,
    computed(() => ({ definitions: props.definitions, statements: props.entry.statements })),
  )
  const { can } = useCreatorPermissions()
  const readonly = computed(
    () => props.entry.protection?.level === 'LOCKED' && !can(WIKI_PERMISSIONS.PATROL),
  )
  const mounted = useMounted()
  const narrow = useMediaQuery('(max-width: 767px)')
  const orientation = computed(() => (mounted.value && narrow.value ? 'vertical' : 'horizontal'))
  const editing = defineModel<{
    property: string
    target: number | 'new'
    code?: string | null
  } | null>('editing', { default: null })
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
  const rows = (group: PropertyGroup) =>
    group.properties.flatMap(property => {
      const owner = definition(property)
      if (!owner) return []
      const fixed = group.codes?.[property]
      const row = (code: string | null, label?: string) => ({
        key: `${property}:${code}`,
        definition: owner,
        label,
        code,
        statements: live(property).filter(item => !fixed || item.code === code),
        deprecated: deprecated(property).filter(item => !fixed || item.code === code),
      })
      if (!fixed) return [row(null)]
      const present = new Set(live(property).map(item => item.code))
      return [
        ...(owner.codes ?? [])
          .filter(code => fixed.includes(code) || present.has(code))
          .map(code => row(code, codeLabel(property, code))),
        ...(present.has(null) ? [row(null)] : []),
      ]
    })
  const target = (property: string, code: string | null) => {
    const current = editing.value
    if (current?.property !== property) return null
    if (current.target !== 'new') return current.target
    return (current.code ?? null) === code ? 'new' : null
  }
  const total = (group: PropertyGroup) =>
    group.properties.reduce((sum, property) => sum + live(property).length, 0)
  const adding = (group: PropertyGroup) =>
    group.add !== undefined &&
    editing.value?.target === 'new' &&
    group.properties.includes(editing.value.property as never) &&
    editing.value.code === undefined
  const add = (group: PropertyGroup) => {
    const property = group.properties[0]
    if (property) editing.value = { property, target: 'new' }
  }
</script>

<template>
  <Stack gap="lg">
    <template v-for="group in groups" :key="group.title">
      <CreatorEntryCreditsTab
        v-if="group.voice && definition('CREDIT')"
        :editing="editing?.property === 'CREDIT' ? editing.target : null"
        :entry="entry"
        :definition="definition('CREDIT')!"
        :readonly="readonly"
        voice
        @update:editing="
          next => (editing = next === null ? null : { property: 'CREDIT', target: next })
        "
        @saved="$emit('saved')"
      />
      <Panel
        v-else
        :title="group.title"
        :count="group.add && total(group) ? total(group) : undefined"
      >
        <template v-if="group.add && !readonly && !adding(group)" #actions>
          <Button variant="ghost" tone="neutral" size="sm" @click="add(group)">
            <template #icon><Plus /></template>
            {{ group.add }}
          </Button>
        </template>
        <Text v-if="group.add && !total(group) && !adding(group)" as="p" size="sm" tone="faint">
          未填写
        </Text>
        <component
          :is="group.bare ? Stack : DescriptionList"
          v-else
          v-bind="
            group.bare
              ? { gap: 'md' }
              : { orientation, class: 'text-sm [--hn-dl-term-width:--spacing(24)]' }
          "
        >
          <template v-for="row in rows(group)" :key="row.key">
            <CreatorEntryRow
              v-if="!group.add || row.statements.length"
              :entry="entry"
              :definition="row.definition"
              :statements="row.statements"
              :deprecated="row.deprecated"
              :readonly="readonly"
              :editing="target(row.definition.property, row.code)"
              :label="row.label"
              :code="row.code"
              :addable="!group.add"
              :bare="group.bare"
              @edit="
                next =>
                  (editing =
                    next === null
                      ? null
                      : { property: row.definition.property, target: next, code: row.code })
              "
              @saved="$emit('saved')"
            />
          </template>
          <template v-if="adding(group) && editing">
            <DescriptionTerm v-if="!group.bare" class="text-muted">
              新{{ group.title }}
            </DescriptionTerm>
            <component :is="group.bare ? Stack : DescriptionDetails">
              <CreatorEntryFormCard
                :entry="entry"
                :definition="definition(editing.property)!"
                :statement="null"
                @cancel="editing = null"
                @saved="
                  () => {
                    editing = null
                    $emit('saved')
                  }
                "
              />
            </component>
          </template>
        </component>
      </Panel>
    </template>
  </Stack>
</template>

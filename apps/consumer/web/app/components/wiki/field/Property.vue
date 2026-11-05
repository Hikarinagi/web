<script setup lang="ts">
  import {
    Button,
    FormField,
    Inline,
    MultiSelect,
    Space,
    Stack,
    TagsInput,
    Text,
  } from '@hina-ui/vue'
  import { Lightbulb, Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { LANGUAGE_LABELS } from '~/features/galgame/labels'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { emptyValue, type PropertyDefinition } from '~/features/wiki/editor/draft'
  import type { QualifierKind } from '~/features/wiki/editor/inputs'
  import { codeLabel } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiFieldProperty' })

  const props = defineProps<{
    entry: number
    definition: PropertyDefinition
    label?: string
    bare?: boolean
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const name = computed(() => props.label ?? props.definition.label)
  const view = computed(() => editor.property(props.entry, props.definition.property))
  const live = computed(() =>
    view.value.values.filter(item => item.state !== 'removed' && item.state !== 'moved_out'),
  )
  const mode = computed(() => {
    const { cardinality, qualifiers, reading, archive, original, shape, move_only } =
      props.definition
    const bare = !qualifiers.length && !reading && !archive && !original && !move_only
    if (bare && cardinality === 'multiple' && (shape === 'text' || shape === 'verbatim'))
      return 'tags'
    if (bare && cardinality === 'multiple' && (shape === 'code' || shape === 'language'))
      return 'chips'
    if (
      bare &&
      cardinality === 'single' &&
      !['entry', 'image', 'credit', 'url', 'identifier'].includes(shape)
    )
      return 'single'
    return 'rows'
  })
  const dirty = computed(() => view.value.values.some(item => item.state !== 'same'))
  const table = computed(() => Boolean(props.bare) && props.definition.shape === 'credit')
  const options = computed(() =>
    props.definition.shape === 'language'
      ? Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }))
      : (props.definition.codes ?? []).map(value => ({
          value,
          label: codeLabel(props.definition.property, value),
        })),
  )
  const addable = computed(
    () =>
      !props.definition.move_only &&
      (props.definition.cardinality !== 'single' ||
        props.definition.qualifiers.length > 0 ||
        !live.value.length),
  )
  const opened = ref<Record<number, QualifierKind[]>>({})
  const repeated = computed(() => {
    if (props.definition.shape !== 'credit') return new Set<number>()
    const key = (value: (typeof live.value)[number]['value']) =>
      `${value.code ?? ''}|${value.target?.id ?? (value.text ?? '').trim()}|${value.part ?? ''}`
    const seen = new Map<string, number[]>()
    for (const item of live.value)
      seen.set(key(item.value), [...(seen.get(key(item.value)) ?? []), item.id])
    return new Set([...seen.values()].filter(ids => ids.length > 1).flat())
  })
  const hints = editor.root ? useEntryHints(editor.root) : null
  const hinted = computed(
    () =>
      (hints?.data.value?.items ?? []).filter(hint => {
        const value = hint.proposal ?? hint.statement
        return value?.entry_id === props.entry && value.property === props.definition.property
      }).length,
  )

  function sync(next: string[], field: 'text' | 'code') {
    const current = live.value.map(item => item.value[field] ?? '')
    for (const item of live.value)
      if (!next.includes(item.value[field] ?? '')) editor.remove(item.id)
    for (const value of next)
      if (!current.includes(value))
        editor.add(props.entry, props.definition.property, { ...emptyValue(), [field]: value })
  }

  function add() {
    const qualifiers = props.definition.qualifiers as QualifierKind[]
    const open: QualifierKind[] = live.value.length
      ? qualifiers.filter(kind => kind === 'period' || kind === 'version')
      : []
    const codes = props.definition.codes ?? []
    const id = editor.add(props.entry, props.definition.property, {
      ...emptyValue(),
      ...(props.definition.shape === 'credit' && codes.length === 1 ? { code: codes[0] } : {}),
    })
    opened.value = { ...opened.value, [id]: open }
  }
</script>

<template>
  <component
    :is="bare ? Stack : FormField"
    :required="bare ? undefined : definition.required"
    :class="
      bare
        ? undefined
        : cn('-ml-3 border-l-2 pl-2.5', dirty ? 'border-accent' : 'border-transparent')
    "
  >
    <template v-if="!bare" #label>
      {{ name }}
      <WikiFieldRule v-if="definition.clauses.length" :label="name" :clauses="definition.clauses" />
    </template>
    <Stack gap="xs" class="min-w-0">
      <Inline v-if="mode === 'tags'" gap="xs" align="center" :wrap="false">
        <TagsInput
          :model-value="live.map(item => item.value.text ?? '')"
          placeholder="输入后按回车"
          :aria-label="name"
          class="min-w-0 flex-1"
          @update:model-value="next => sync(next, 'text')"
        />
        <Space class="w-8 shrink-0" />
      </Inline>
      <Inline v-else-if="mode === 'chips'" gap="xs" align="center" :wrap="false">
        <MultiSelect
          :model-value="live.map(item => item.value.code ?? '')"
          :options="options"
          placeholder="请选择"
          :aria-label="name"
          class="min-w-0 flex-1"
          @update:model-value="next => sync(next.map(String), 'code')"
        />
        <Space class="w-8 shrink-0" />
      </Inline>
      <WikiFieldImages
        v-else-if="bare && definition.shape === 'image'"
        :entry="entry"
        :definition="definition"
        :label="name"
        :view="view"
      />
      <WikiFieldSingle
        v-else-if="mode === 'single'"
        :entry="entry"
        :definition="definition"
        :label="name"
        :view="view"
      />
      <template v-else>
        <Stack
          :gap="table ? 'none' : 'sm'"
          :class="cn(table && view.values.length && 'rounded-md border border-line')"
        >
          <Inline
            v-if="table && view.values.length"
            gap="md"
            :wrap="false"
            class="border-b border-line px-3 py-2 max-md:hidden"
          >
            <Text size="xs" tone="muted" class="w-48 shrink-0">职责</Text>
            <Text size="xs" tone="muted" class="flex-1">名字</Text>
          </Inline>
          <WikiFieldValue
            v-for="(item, index) in view.values"
            :key="item.id"
            :item="item"
            :entry="entry"
            :definition="definition"
            :label="name"
            :table="table"
            :up="item.id > 0 && index > 0 && (view.values[index - 1]?.id ?? 0) > 0"
            :down="item.id > 0 && (view.values[index + 1]?.id ?? 0) > 0"
            :open="opened[item.id]"
            :repeated="repeated.has(item.id)"
          />
        </Stack>
        <Button v-if="addable" variant="ghost" size="sm" class="self-start" @click="add">
          <template #icon><Plus /></template>
          {{ live.length || definition.cardinality === 'multiple' ? `添加${name}` : `填写${name}` }}
        </Button>
      </template>
      <WikiFieldBefore v-if="mode !== 'rows' && dirty" :view="view" :definition="definition" />
      <WikiFieldDeleted
        v-if="view.deprecated.length"
        :items="view.deprecated"
        :definition="definition"
        :entry="entry"
      />
      <Button
        v-if="hinted"
        :as="NuxtLink"
        :to="{ query: { ...route.query, side: 'hints', focus: `${entry}|${definition.property}` } }"
        size="sm"
        variant="ghost"
        class="self-start"
      >
        <template #icon><Lightbulb /></template>
        {{ hinted }} 条建议
      </Button>
    </Stack>
  </component>
</template>

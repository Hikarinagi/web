<script setup lang="ts">
  import { IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { Undo2 } from '@lucide/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { PropertyDefinition, ValueDraft } from '~/features/wiki/editor/draft'
  import {
    extrasSet,
    qualifiersSet,
    type ExtraKind,
    type QualifierKind,
  } from '~/features/wiki/editor/inputs'
  import type { WorkingValue } from '~/features/wiki/editor/working'
  import { LONG_PROPERTIES, valueText } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiFieldValue' })

  const props = defineProps<{
    item: WorkingValue
    entry: number
    definition: PropertyDefinition
    label: string
    up: boolean
    down: boolean
    open?: QualifierKind[]
    repeated?: boolean
    table?: boolean
    card?: boolean
    ratio?: number
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const nav = usePageNav()
  const moved = computed(() =>
    props.item.moved === null
      ? null
      : (editor.members.value.find(member => member.id === props.item.moved)?.entry?.label ??
        '未命名'),
  )
  const root = useTemplateRef<ComponentPublicInstance>('root')
  onMounted(() =>
    watch(
      () => route.query.focus,
      focus => {
        if (focus === String(props.item.id))
          (root.value?.$el as HTMLElement | undefined)?.scrollIntoView({ block: 'center' })
      },
      { immediate: true },
    ),
  )

  const shown = ref<QualifierKind[]>([
    ...new Set([...qualifiersSet(props.item.value), ...(props.open ?? [])]),
  ])
  const extras = ref<ExtraKind[]>(extrasSet(props.item.value))
  const value = computed({
    get: () => props.item.value,
    set: next => editor.set(props.item.id, next),
  })
  const patch = (fields: Partial<ValueDraft>) => (value.value = { ...value.value, ...fields })
  const inactive = computed(
    () => props.item.state === 'removed' || props.item.state === 'moved_out',
  )
  const shape = computed(() => props.definition.shape)
  const long = computed(() => LONG_PROPERTIES.includes(props.definition.property))
  const rating = computed(() => {
    const media = value.value.media
    return media
      ? (editor.draft.value.rated[media.id] ?? { sexual: media.sexual, violence: media.violence })
      : { sexual: null, violence: null }
  })
  const tone = computed(() => {
    if (props.item.state === 'same') return props.card ? 'border-line' : 'border-transparent'
    if (props.item.state === 'added' || props.item.state === 'moved_in') return 'border-success'
    if (inactive.value) return 'border-danger'
    return 'border-accent'
  })

  const relocatable = computed(() => {
    const type = editor.members.value.find(member => member.id === props.entry)?.type
    return (
      props.item.id > 0 &&
      editor.members.value.some(member => member.id !== props.entry && member.type === type)
    )
  })

  function remove() {
    if (props.item.state === 'added') editor.revert(props.item.id)
    else editor.remove(props.item.id)
  }

  const menu = computed(() => ({
    label: props.label,
    added: props.item.state === 'added',
    definition: props.definition,
    value: value.value,
    shown: shown.value,
    extras: extras.value,
    up: props.up,
    down: props.down,
    relocatable: relocatable.value,
  }))
  const actions = {
    qualify: (kind: QualifierKind) => shown.value.push(kind),
    extra: (kind: ExtraKind) => extras.value.push(kind),
    unknown: (on: boolean) => patch({ value_kind: on ? 'UNKNOWN' : 'VALUE' }),
    move: (step: -1 | 1) =>
      editor.order(props.entry, props.definition.property, props.item.id, step),
    relocate: () =>
      nav.query({ move: `${props.entry}|${props.definition.property}|${props.item.id}` }),
    remove,
  }
</script>

<template>
  <Stack
    ref="root"
    gap="xs"
    :class="
      cn(
        card
          ? 'rounded-md border p-2'
          : table
            ? 'border-b border-l-2 border-b-line px-3 py-2.5 last:border-b-0'
            : '-ml-3 border-l-2 pl-2.5',
        tone,
      )
    "
  >
    <Inline v-if="inactive" gap="sm" align="center" :wrap="false" class="min-h-9">
      <Text size="sm" tone="muted" class="min-w-0 flex-1 truncate line-through">
        {{ valueText({ ...item.value, property: definition.property }) || '空' }}
      </Text>
      <Text v-if="item.state === 'moved_out' && moved" size="xs" tone="muted" class="shrink-0">
        移到「{{ moved }}」
      </Text>
      <IconButton
        label="恢复"
        variant="ghost"
        tone="neutral"
        size="sm"
        @click="editor.revert(item.id)"
      >
        <Undo2 />
      </IconButton>
    </Inline>
    <Inline v-else gap="xs" :align="long ? 'start' : 'center'" :wrap="false">
      <Stack class="min-w-0 flex-1">
        <Inline
          v-if="value.value_kind === 'UNKNOWN'"
          gap="sm"
          align="center"
          :wrap="false"
          class="h-9 rounded-md border border-dashed border-line bg-subtle px-3"
        >
          <Text size="sm" tone="muted">未知</Text>
        </Inline>
        <WikiFieldEntry
          v-else-if="shape === 'entry'"
          v-model="value"
          :definition="definition"
          :label="label"
        />
        <WikiFieldIdentifier
          v-else-if="shape === 'identifier' || shape === 'url'"
          v-model="value"
          :definition="definition"
          :label="label"
        />
        <WikiFieldCredit
          v-else-if="shape === 'credit'"
          v-model="value"
          :definition="definition"
          :label="label"
        />
        <WikiFieldImage
          v-else-if="shape === 'image'"
          v-model="value"
          :label="label"
          :card="card"
          :ratio="ratio"
          :rating="rating"
          @rate="next => value.media && editor.rate(item.id, value.media, next)"
        >
          <template #menu><WikiFieldMenu v-bind="menu" v-on="actions" /></template>
        </WikiFieldImage>
        <WikiFieldSimple v-else v-model="value" :definition="definition" :label="label" />
      </Stack>
      <WikiFieldMenu v-if="!card" v-bind="menu" v-on="actions" />
    </Inline>
    <WikiFieldExtras v-if="!inactive" v-model="value" v-model:extras="extras" />
    <WikiFieldQualifiers
      v-if="!inactive"
      v-model="value"
      v-model:shown="shown"
      :versions="editor.versions.value"
    />
    <Text v-if="repeated && !inactive" size="xs" tone="warning">职责与名字都与另一行相同</Text>
    <WikiFieldChange
      v-if="!inactive"
      :item="item"
      :long="long"
      :image="shape === 'image'"
      @revert="editor.revert(item.id)"
    />
  </Stack>
</template>

<script setup lang="ts">
  import { Inline, Link, Stack, Text } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { hintsOn } from '~/features/wiki/hints'
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
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const hints = editor.root ? useEntryHints(editor.root) : null
  const hinted = computed(() =>
    props.item.id > 0 && hints?.data.value
      ? hintsOn(hints.data.value.items, props.item.id).length
      : 0,
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
  const tone = computed(() =>
    props.item.state === 'added'
      ? 'border-success bg-success-soft'
      : props.item.state === 'same'
        ? 'border-transparent'
        : 'border-accent',
  )

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
</script>

<template>
  <Stack ref="root" gap="xs" :class="cn('rounded-sm border-l-2 py-1 pl-3', tone)">
    <Inline gap="sm" align="start" :wrap="false">
      <Stack class="min-w-0 flex-1">
        <Text v-if="inactive" size="sm" tone="muted" class="py-2 line-through">
          {{ valueText({ ...item.value, property: definition.property }) || '空' }}
        </Text>
        <Text v-else-if="value.value_kind === 'UNKNOWN'" size="sm" tone="muted" class="py-2">
          存在，但值未知
        </Text>
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
          :rating="rating"
          @rate="next => value.media && editor.rate(item.id, value.media.id, next)"
        />
        <WikiFieldSimple v-else v-model="value" :definition="definition" :label="label" />
      </Stack>
      <WikiFieldMenu
        v-if="!inactive"
        :definition="definition"
        :value="value"
        :shown="shown"
        :extras="extras"
        :up="up"
        :down="down"
        :relocatable="relocatable"
        @qualify="kind => shown.push(kind)"
        @extra="kind => extras.push(kind)"
        @unknown="on => patch({ value_kind: on ? 'UNKNOWN' : 'VALUE' })"
        @move="step => editor.order(entry, definition.property, item.id, step)"
        @relocate="
          navigateTo({
            query: { ...route.query, move: `${entry}|${definition.property}|${item.id}` },
          })
        "
        @remove="remove"
      />
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
      :item="item"
      :long="long"
      :image="shape === 'image'"
      @revert="editor.revert(item.id)"
    />
    <Link
      v-if="hinted"
      :as="NuxtLink"
      :to="{ query: { ...route.query, side: 'hints', focus: String(item.id) } }"
      class="self-start text-xs"
    >
      {{ hinted }} 条建议
    </Link>
  </Stack>
</template>

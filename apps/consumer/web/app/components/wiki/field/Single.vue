<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import {
    emptyValue,
    isBlank,
    type PropertyDefinition,
    type ValueDraft,
  } from '~/features/wiki/editor/draft'
  import type { WorkingProperty } from '~/features/wiki/editor/working'
  import { LONG_PROPERTIES } from '~/features/wiki/values'

  defineOptions({ name: 'WikiFieldSingle' })

  const props = defineProps<{
    entry: number
    definition: PropertyDefinition
    label: string
    view: WorkingProperty
  }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const first = computed(
    () =>
      props.view.values.find(item => item.state !== 'removed' && item.state !== 'moved_out') ??
      null,
  )
  const removed = computed(() => props.view.values.find(item => item.state === 'removed') ?? null)
  const long = computed(() => LONG_PROPERTIES.includes(props.definition.property))

  const value = computed<ValueDraft>({
    get: () => first.value?.value ?? emptyValue(),
    set: next => {
      const item = first.value
      if (item) {
        if (isBlank(next)) editor.remove(item.id)
        else editor.set(item.id, next)
      } else if (!isBlank(next)) {
        if (removed.value) {
          const id = removed.value.id
          editor.revert(id)
          editor.set(id, next)
        } else editor.add(props.entry, props.definition.property, next)
      }
    },
  })

  const root = useTemplateRef<ComponentPublicInstance>('root')
  onMounted(() =>
    watch(
      () => route.query.focus,
      focus => {
        const id = first.value?.id ?? removed.value?.id
        if (id !== undefined && focus === String(id))
          (root.value?.$el as HTMLElement | undefined)?.scrollIntoView({ block: 'center' })
      },
      { immediate: true },
    ),
  )
</script>

<template>
  <Inline ref="root" gap="xs" :align="long ? 'start' : 'center'" :wrap="false">
    <Inline
      v-if="value.value_kind === 'UNKNOWN'"
      gap="sm"
      align="center"
      :wrap="false"
      class="h-9 min-w-0 flex-1 rounded-md border border-dashed border-line bg-subtle px-3"
    >
      <Text size="sm" tone="muted">未知</Text>
    </Inline>
    <WikiFieldSimple
      v-else
      v-model="value"
      :definition="definition"
      :label="label"
      class="min-w-0 flex-1"
    />
    <WikiFieldMenu
      fixed
      :label="label"
      :definition="definition"
      :value="value"
      :shown="[]"
      :extras="[]"
      :up="false"
      :down="false"
      @unknown="on => (value = { ...value, value_kind: on ? 'UNKNOWN' : 'VALUE' })"
    />
  </Inline>
</template>

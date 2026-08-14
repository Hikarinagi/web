<script setup lang="ts">
  import { Tags } from '@lucide/vue'
  import Popover from 'primevue/popover'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import { enumLabel, enumOptions } from '~/features/creator/editor/presentation/enum-labels'
  import { LANGUAGE_LABELS, LANGUAGE_OPTIONS } from '~/features/galgame/labels'

  const props = defineProps<{
    attributes: NonNullable<BackendEditorField['attributes']>[number][]
  }>()
  const row = defineModel<EditorRelationRow>('row', { required: true })
  const fieldId = useId()
  const popRef = useTemplateRef<InstanceType<typeof Popover>>('popRef')

  const ATTR_LABEL: Record<string, string> = { language: '语言', kind: '类型' }

  function text(name: string): string {
    const value = row.value.attributes[name]
    return typeof value === 'string' ? value : ''
  }

  function setAttr(name: string, value: string | null) {
    row.value = { ...row.value, attributes: { ...row.value.attributes, [name]: value } }
  }

  const summary = computed(() =>
    props.attributes
      .map(attr => {
        const value = text(attr.name)
        if (!value) return ''
        if (attr.name === 'language') {
          return LANGUAGE_LABELS[value as keyof typeof LANGUAGE_LABELS] ?? value
        }
        return attr.value_type === 'enum' ? enumLabel(attr.enum_name, value) : value
      })
      .filter(Boolean)
      .join(' · '),
  )
</script>

<template>
  <Button
    v-tooltip.top="'标注封面语言与类型'"
    unstyled
    :class="[
      'flex h-6 items-center gap-1 rounded-full px-2 text-[10px] font-medium transition-colors',
      summary ? 'bg-surface-0/90 text-surface-900' : 'bg-surface-900/55 text-white',
    ]"
    @click="event => popRef?.toggle(event)"
  >
    <Tags :size="11" />
    {{ summary || '标注' }}
  </Button>

  <Popover ref="popRef">
    <div class="flex w-56 flex-col gap-3">
      <div v-for="attr in attributes" :key="attr.name" class="flex flex-col gap-1.5">
        <label :for="`${fieldId}-${attr.name}`" class="text-xs font-medium">
          {{ ATTR_LABEL[attr.name] ?? attr.name }}
        </label>
        <Select
          :input-id="`${fieldId}-${attr.name}`"
          :model-value="text(attr.name) || null"
          :options="
            attr.name === 'language'
              ? LANGUAGE_OPTIONS
              : enumOptions(attr.enum_name, attr.enum_values ?? [])
          "
          option-label="label"
          option-value="value"
          placeholder="未标注"
          size="small"
          show-clear
          fluid
          @update:model-value="
            value => setAttr(attr.name, typeof value === 'string' ? value : null)
          "
        />
        <small v-if="attr.help" class="text-xs text-muted-color">{{ attr.help }}</small>
      </div>
    </div>
  </Popover>
</template>

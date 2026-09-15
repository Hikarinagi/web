<script setup lang="ts">
  import { FormField, Popover, Select, Stack, Tag } from '@hina-ui/vue'
  import { Tags } from '@lucide/vue'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import { enumLabel, enumOptions } from '~/features/creator/editor/presentation/enum-labels'
  import { LANGUAGE_LABELS, LANGUAGE_OPTIONS } from '~/features/galgame/labels'

  const props = defineProps<{
    attributes: NonNullable<BackendEditorField['attributes']>[number][]
  }>()
  const row = defineModel<EditorRelationRow>('row', { required: true })

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
  <Popover align="start" class="w-56">
    <Tag
      v-tooltip="summary || '标注封面语言与类型'"
      as="button"
      type="button"
      size="sm"
      variant="solid"
      :tone="summary ? 'neutral' : 'accent'"
      class="hn-state-layer min-w-0 hn-interactive"
    >
      <Tags aria-hidden="true" />
      <span class="truncate">{{ summary || '标注' }}</span>
    </Tag>

    <template #content>
      <Stack gap="sm">
        <FormField
          v-for="attr in attributes"
          :key="attr.name"
          :label="ATTR_LABEL[attr.name] ?? attr.name"
          :description="attr.help ?? undefined"
          description-placement="control"
        >
          <Select
            size="sm"
            :model-value="text(attr.name) || null"
            :options="
              attr.name === 'language'
                ? LANGUAGE_OPTIONS
                : enumOptions(attr.enum_name, attr.enum_values ?? [])
            "
            placeholder="未标注"
            clearable
            @update:model-value="
              value => setAttr(attr.name, typeof value === 'string' ? value : null)
            "
          />
        </FormField>
      </Stack>
    </template>
  </Popover>
</template>

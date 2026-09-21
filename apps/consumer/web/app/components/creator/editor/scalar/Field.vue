<script setup lang="ts">
  import {
    Combobox,
    DatePicker,
    FormField,
    Input,
    MultiCombobox,
    MultiSelect,
    NumberInput,
    Select,
    Switch,
    TagsInput,
    Textarea,
  } from '@hina-ui/vue'
  import type { BackendEditorField, BackendEditorRef } from '~/features/creator/editor'
  import type { MediaValue } from '~/components/media-library/types'
  import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
  import { CONTROL_HINT } from '~/features/creator/editor/presentation/control-hints'
  import { enumOptions } from '~/features/creator/editor/presentation/enum-labels'

  const props = defineProps<{
    field: BackendEditorField
    presentation?: EditorFieldPresentation
    siblingValues?: Record<string, unknown>
    initialValue?: unknown
    initialRefEntity?: BackendEditorRef
  }>()
  const model = defineModel<unknown>()

  const disabled = computed(() => {
    const fn = props.presentation?.enableWhen
    return fn ? !fn(props.siblingValues ?? {}) : false
  })

  const label = computed(() => props.presentation?.label ?? props.field.field)

  const hint = computed(
    () =>
      props.field.help ??
      props.presentation?.help ??
      (props.field.value_type ? CONTROL_HINT[props.field.value_type] : undefined),
  )

  // 后端 Prisma 枚举：enum_values 是原始码，按 enum_name 映射可读 label。
  const enumSelectOptions = computed(() =>
    enumOptions(props.field.enum_name, props.field.enum_values ?? []),
  )

  const asString = computed<string>({
    get: () => (typeof model.value === 'string' ? model.value : ''),
    set: value => {
      model.value = value === '' && props.field.nullable ? null : value
    },
  })
  const asSelectValue = computed<string | number | null>({
    get: () => (typeof model.value === 'string' ? model.value : null),
    set: value => {
      model.value = typeof value === 'string' && value !== '' ? value : null
    },
  })
  const asNumber = computed<number | null>({
    get: () => (typeof model.value === 'number' ? model.value : null),
    set: value => {
      model.value = value ?? null
    },
  })
  const asBoolean = computed<boolean>({
    get: () => model.value === true,
    set: value => {
      model.value = value
    },
  })
  const asArray = computed<string[]>({
    get: () => (Array.isArray(model.value) ? (model.value as string[]) : []),
    set: value => {
      model.value = value
    },
  })
  const asSelectArray = computed<Array<string | number>>({
    get: () => (Array.isArray(model.value) ? (model.value as Array<string | number>) : []),
    set: value => {
      model.value = value.map(String)
    },
  })
  const asObjectArray = computed<Record<string, unknown>[]>({
    get: () => (Array.isArray(model.value) ? (model.value as Record<string, unknown>[]) : []),
    set: value => {
      model.value = value
    },
  })
  const asMedia = computed<MediaValue | null>({
    get: () => {
      const value = model.value
      if (value && typeof value === 'object' && 'id' in value && 'src' in value) {
        return value as MediaValue
      }
      return null
    },
    set: value => {
      model.value = value
    },
  })
  const asIsoDate = computed<string | null>({
    get: () => {
      const value = model.value
      if (!(value instanceof Date) || Number.isNaN(value.getTime())) return null
      const month = `${value.getMonth() + 1}`.padStart(2, '0')
      const day = `${value.getDate()}`.padStart(2, '0')
      return `${value.getFullYear()}-${month}-${day}`
    },
    set: value => {
      if (!value) {
        model.value = null
        return
      }
      const [year, month, day] = value.split('-').map(Number)
      model.value = new Date(year!, (month ?? 1) - 1, day ?? 1)
    },
  })
</script>

<template>
  <FormField
    :name="field.field"
    :required="field.required"
    :description="hint"
    description-placement="control"
    :disabled="disabled"
  >
    <template #label>
      {{ label }}
      <CreatorEditorFieldReset v-model="model" :initial="initialValue" />
    </template>

    <CreatorEditorScalarRefField
      v-if="field.value_type === 'ref'"
      v-model="asNumber"
      :field="field"
      :initial-entity="initialRefEntity"
      :disabled="disabled"
    />

    <CreatorEditorScalarLabelsField
      v-else-if="presentation?.control === 'labels'"
      v-model="asObjectArray"
      :field="field"
      :disabled="disabled"
    />

    <CreatorEditorScalarExternalLinksField
      v-else-if="presentation?.control === 'external-links'"
      v-model="asObjectArray"
      :field="field"
      :disabled="disabled"
    />

    <CreatorEditorScalarSteamAppsField
      v-else-if="presentation?.control === 'steam-apps'"
      v-model="asObjectArray"
      :field="field"
      :disabled="disabled"
    />

    <CreatorEditorScalarPricesField
      v-else-if="field.value_type === 'object[]'"
      v-model="asObjectArray"
      :field="field"
      :disabled="disabled"
    />

    <MediaLibraryPicker
      v-else-if="field.value_type === 'media'"
      v-model="asMedia"
      :disabled="disabled"
    />

    <Select
      v-else-if="field.value_type === 'enum'"
      v-model="asSelectValue"
      :options="enumSelectOptions"
      :disabled="disabled"
      :clearable="field.nullable"
    />
    <MultiSelect
      v-else-if="field.value_type === 'enum[]'"
      v-model="asSelectArray"
      :options="enumSelectOptions"
      :disabled="disabled"
    />
    <Combobox
      v-else-if="presentation?.control === 'select'"
      v-model="asSelectValue"
      :options="presentation.options ?? []"
      :disabled="disabled"
      :clearable="field.nullable"
    />
    <MultiCombobox
      v-else-if="presentation?.control === 'multiselect'"
      v-model="asSelectArray"
      :options="presentation.options ?? []"
      :disabled="disabled"
    />
    <Switch v-else-if="field.value_type === 'boolean'" v-model="asBoolean" :disabled="disabled" />
    <NumberInput
      v-else-if="field.value_type === 'int' || field.value_type === 'float'"
      v-model="asNumber"
      :format-options="{
        maximumFractionDigits: field.value_type === 'float' ? 2 : 0,
        useGrouping: false,
      }"
      :disabled="disabled"
    />
    <TagsInput v-else-if="field.value_type === 'string[]'" v-model="asArray" :disabled="disabled" />
    <DatePicker
      v-else-if="field.value_type === 'date'"
      v-model="asIsoDate"
      :disabled="disabled"
      clearable
    />
    <Textarea
      v-else-if="presentation?.control === 'textarea'"
      :model-value="asString.replace(/\r\n?/g, '\n')"
      :autosize="{ minRows: 4 }"
      :disabled="disabled"
      @update:model-value="value => (asString = value ?? '')"
    />
    <Input v-else v-model="asString" :disabled="disabled" />
  </FormField>
</template>

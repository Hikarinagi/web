<script setup lang="ts">
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

  // 子组件的 PrimeVue 输入由本组件手动桥接给外层 FormField。
  // 否则 InputNumber 会同时被 FormField 注入和本组件 v-model 控制,清空 nullable 数字时会回弹旧值。
  provide('$pcFormField', undefined)
  provide('$pcForm', undefined)

  const disabled = computed(() => {
    const fn = props.presentation?.enableWhen
    return fn ? !fn(props.siblingValues ?? {}) : false
  })

  const fieldId = useId()
  const label = computed(() => props.presentation?.label ?? props.field.field)

  const showRequiredMark = computed(() => props.field.required === true)

  const hint = computed(
    () =>
      props.field.help ??
      props.presentation?.help ??
      (props.field.value_type ? CONTROL_HINT[props.field.value_type] : undefined),
  )

  // 后端 Prisma 枚举:enum_values 是原始码,按 enum_name 映射可读 label。
  const enumSelectOptions = computed(() =>
    enumOptions(props.field.enum_name, props.field.enum_values ?? []),
  )

  const asString = computed<string>({
    get: () => (typeof model.value === 'string' ? model.value : ''),
    set: value => {
      model.value = value === '' && props.field.nullable ? null : value
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
  // 日期字段若有对应的 `<field>_year_only` 布尔开关且为真,只允许选年,保存规整为 YYYY-01-01。
  const yearOnly = computed(() => props.siblingValues?.[`${props.field.field}_year_only`] === true)
  const asDate = computed<Date | null>({
    get: () => (model.value instanceof Date ? model.value : null),
    set: value => {
      model.value = value && yearOnly.value ? new Date(value.getFullYear(), 0, 1) : value
    },
  })
</script>

<template>
  <div class="space-y-1.5">
    <label :for="fieldId" class="flex items-center gap-1 text-sm font-medium">
      {{ label }}
      <span v-if="showRequiredMark" class="text-red-500" aria-hidden="true">*</span>
      <CreatorEditorFieldReset v-model="model" :initial="initialValue" />
    </label>

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
      :input-id="fieldId"
      :disabled="disabled"
    />

    <CreatorEditorScalarExternalLinksField
      v-else-if="presentation?.control === 'external-links'"
      v-model="asObjectArray"
      :field="field"
      :input-id="fieldId"
      :disabled="disabled"
    />

    <CreatorEditorScalarSteamAppsField
      v-else-if="presentation?.control === 'steam-apps'"
      v-model="asObjectArray"
      :field="field"
      :input-id="fieldId"
      :disabled="disabled"
    />

    <CreatorEditorScalarPricesField
      v-else-if="field.value_type === 'object[]'"
      v-model="asObjectArray"
      :field="field"
      :input-id="fieldId"
      :disabled="disabled"
    />

    <MediaLibraryPicker
      v-else-if="field.value_type === 'media'"
      v-model="asMedia"
      :disabled="disabled"
    />

    <Select
      v-else-if="field.value_type === 'enum'"
      v-model="asString"
      :input-id="fieldId"
      :options="enumSelectOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      :show-clear="field.nullable"
      fluid
    />
    <MultiSelect
      v-else-if="field.value_type === 'enum[]'"
      v-model="asArray"
      :input-id="fieldId"
      :options="enumSelectOptions"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      fluid
    />
    <Select
      v-else-if="presentation?.control === 'select'"
      v-model="asString"
      :input-id="fieldId"
      :options="presentation.options ?? []"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      :show-clear="field.nullable"
      filter
      fluid
    />
    <MultiSelect
      v-else-if="presentation?.control === 'multiselect'"
      v-model="asArray"
      :input-id="fieldId"
      :options="presentation.options ?? []"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      filter
      fluid
    />
    <ToggleSwitch
      v-else-if="field.value_type === 'boolean'"
      v-model="asBoolean"
      :input-id="fieldId"
      :disabled="disabled"
    />
    <InputNumber
      v-else-if="field.value_type === 'int' || field.value_type === 'float'"
      v-model="asNumber"
      :input-id="fieldId"
      :max-fraction-digits="field.value_type === 'float' ? 2 : 0"
      :disabled="disabled"
      fluid
      :use-grouping="false"
      @input="event => (asNumber = typeof event.value === 'number' ? event.value : null)"
    />
    <AutoComplete
      v-else-if="field.value_type === 'string[]'"
      v-model="asArray"
      :input-id="fieldId"
      multiple
      :typeahead="false"
      :disabled="disabled"
      fluid
    />
    <DatePicker
      v-else-if="field.value_type === 'date'"
      v-model="asDate"
      :input-id="fieldId"
      :view="yearOnly ? 'year' : 'date'"
      :date-format="yearOnly ? 'yy' : 'yy-mm-dd'"
      :disabled="disabled"
      show-icon
      show-button-bar
    />
    <Textarea
      v-else-if="presentation?.control === 'textarea'"
      :id="fieldId"
      :model-value="asString.replace(/\r\n?/g, '\n')"
      rows="4"
      auto-resize
      fluid
      :disabled="disabled"
      @update:model-value="value => (asString = typeof value === 'string' ? value : '')"
    />
    <InputText v-else :id="fieldId" v-model="asString" :disabled="disabled" fluid />

    <small v-if="hint" class="block text-muted-color">{{ hint }}</small>
  </div>
</template>

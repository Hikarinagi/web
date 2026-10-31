<script setup lang="ts">
  import {
    Checkbox,
    FormField,
    Inline,
    Input,
    SegmentedControl,
    Select,
    Stack,
    Textarea,
  } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'
  import { codeLabel, isLong } from '~/features/creator/entry/values'
  import { CURRENCY_SYMBOL, LANGUAGE_OPTIONS } from '~/features/galgame/labels'

  defineOptions({ name: 'CreatorEntryFormValue' })
  const props = defineProps<{
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
    fixed?: string
  }>()
  const values = defineModel<StatementValues>('values', { required: true })

  const CURRENCIES = [
    { value: 'JPY', label: '日元' },
    { value: 'CNY', label: '人民币' },
    { value: 'USD', label: '美元' },
    { value: 'TWD', label: '新台币' },
    { value: 'HKD', label: '港币' },
    { value: 'KRW', label: '韩元' },
    { value: 'EUR', label: '欧元' },
  ]
  const TAX = [
    { value: 'excluded', label: '不含税' },
    { value: 'included', label: '含税' },
    { value: 'unknown', label: '未注明' },
  ]
  const PRECISIONS = [
    { value: 4, label: '年' },
    { value: 7, label: '年月' },
    { value: 10, label: '年月日' },
  ]
  const PLACEHOLDERS: Record<number, string> = { 4: '2012', 7: '2012-10', 10: '2012-10-26' }
  const shape = computed(() => props.definition.shape)
  const codes = computed(() =>
    shape.value === 'language'
      ? LANGUAGE_OPTIONS
      : (props.definition.codes ?? []).map(code => ({
          value: code,
          label: codeLabel(props.definition.property, code),
        })),
  )
  const precision = ref(
    values.value.date.length === 4 || values.value.date.length === 7
      ? values.value.date.length
      : 10,
  )
  watch(precision, length => {
    values.value.date = values.value.date.slice(0, length)
  })
  const single = computed(
    () =>
      ['text', 'verbatim', 'date', 'integer'].includes(shape.value) &&
      !props.definition.reading &&
      !props.definition.machine_translation,
  )
  const label = computed(() =>
    props.statement && single.value ? undefined : props.definition.label,
  )
</script>

<template>
  <CreatorEntryFormCredit
    v-if="shape === 'credit'"
    v-model:values="values"
    :definition="definition"
    :statement="statement"
  />
  <CreatorEntryFormEntry
    v-else-if="shape === 'entry'"
    v-model:values="values"
    :definition="definition"
    :statement="statement"
  />
  <FormField v-else-if="shape === 'date'" name="date" :label="label">
    <Inline gap="sm" align="center">
      <SegmentedControl v-model="precision" :options="PRECISIONS" aria-label="精度" />
      <Input
        v-model="values.date"
        variant="secondary"
        class="max-w-44"
        :placeholder="PLACEHOLDERS[precision]"
        :aria-label="definition.label"
      />
    </Inline>
  </FormField>
  <Stack v-else-if="shape === 'money'" gap="md">
    <Inline gap="md" align="end" wrap>
      <FormField name="amount" label="金额">
        <Input v-model="values.amount" variant="secondary" inputmode="decimal" class="max-w-44">
          <template #leading>{{ CURRENCY_SYMBOL[values.currency] ?? values.currency }}</template>
        </Input>
      </FormField>
      <FormField name="currency" label="币种">
        <Select v-model="values.currency" variant="secondary" :options="CURRENCIES" class="w-32" />
      </FormField>
      <FormField name="tax" label="税">
        <SegmentedControl v-model="values.tax" :options="TAX" />
      </FormField>
    </Inline>
    <FormField v-if="definition.original" name="original" label="原文">
      <Input v-model="values.original" variant="secondary" lang="ja" placeholder="照来源原文填写" />
    </FormField>
  </Stack>
  <Stack v-else-if="shape === 'code' || shape === 'language'" gap="md">
    <FormField
      name="code"
      :label="statement && !definition.original ? undefined : definition.label"
    >
      <Select
        v-model="values.code"
        variant="secondary"
        :options="codes"
        class="max-w-60"
        :aria-label="definition.label"
      />
    </FormField>
    <FormField v-if="definition.original" name="original" label="原文">
      <Input v-model="values.original" variant="secondary" lang="ja" placeholder="照来源原文填写" />
    </FormField>
  </Stack>
  <Inline v-else-if="shape === 'identifier'" gap="md" align="start">
    <FormField
      v-if="!fixed && definition.codes"
      name="code"
      :label="
        { CHANNEL_CODE: '渠道', EXTERNAL_LINK: '网站' }[definition.property as string] ?? '类型'
      "
      class="w-40"
    >
      <Select v-model="values.code" variant="secondary" :options="codes" />
    </FormField>
    <FormField name="text" class="min-w-0 flex-1">
      <template #label>
        {{ fixed ? `${codeLabel(definition.property, fixed)}编号` : '编号' }}
        <CreatorEntryHint
          v-if="definition.property === 'EXTERNAL_LINK'"
          name="external"
          class="ms-1 align-middle"
        />
      </template>
      <Input v-model="values.text" variant="secondary" />
    </FormField>
  </Inline>
  <Stack v-else-if="shape === 'url'" gap="md">
    <Inline gap="md" align="start">
      <FormField v-if="definition.codes" name="code" label="类型" class="w-40">
        <Select v-model="values.code" variant="secondary" :options="codes" />
      </FormField>
      <FormField name="text" label="网址" class="min-w-0 flex-1">
        <Input v-model="values.text" variant="secondary" inputmode="url" />
      </FormField>
    </Inline>
    <FormField v-if="definition.archive" name="archive" label="网页存档">
      <Input
        v-model="values.archive"
        variant="secondary"
        inputmode="url"
        placeholder="页面失效后填写存档网址"
      />
    </FormField>
  </Stack>
  <Stack v-else gap="md">
    <Inline gap="md" align="start">
      <FormField name="text" :label="label" class="min-w-0 flex-1">
        <Textarea
          v-if="isLong(definition)"
          v-model="values.text"
          variant="secondary"
          :rows="6"
          :aria-label="definition.label"
        />
        <Input v-else v-model="values.text" variant="secondary" :aria-label="definition.label" />
      </FormField>
      <FormField v-if="definition.reading" name="reading" label="读音" class="min-w-0 flex-1">
        <Input v-model="values.reading" variant="secondary" lang="ja" />
      </FormField>
      <FormField
        v-if="definition.qualifiers.includes('language')"
        name="language"
        label="语言"
        class="w-40"
      >
        <Select
          v-model="values.language"
          variant="secondary"
          :options="LANGUAGE_OPTIONS"
          clearable
        />
      </FormField>
    </Inline>
    <FormField v-if="definition.machine_translation" name="machine">
      <Checkbox v-model="values.machine">机器翻译</Checkbox>
    </FormField>
  </Stack>
</template>

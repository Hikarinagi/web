<script setup lang="ts">
  import { FormField, Inline, Input, SegmentedControl, Select, Textarea } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'
  import { codeLabel, isLong } from '~/features/creator/entry/values'
  import { SONG_KIND_LABELS, SONG_ROLES } from '~/features/entry/labels'
  import { LANGUAGE_OPTIONS } from '~/features/galgame/labels'

  defineOptions({ name: 'CreatorEntryFormValue' })
  const props = defineProps<{
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
  }>()
  const values = defineModel<StatementValues>('values', { required: true })

  const CURRENCIES = ['JPY', 'CNY', 'USD', 'TWD', 'HKD', 'KRW', 'EUR'].map(value => ({
    value,
    label: value,
  }))
  const SONG_KINDS = Object.entries(SONG_KIND_LABELS).map(([value, label]) => ({ value, label }))
  const TAX = [
    { value: 'excluded', label: '不含税' },
    { value: 'included', label: '含税' },
    { value: 'unknown', label: '未注明' },
  ]
  const codes = computed(() =>
    props.definition.shape === 'language'
      ? LANGUAGE_OPTIONS
      : (props.definition.codes ?? []).map(code => ({
          value: code,
          label: codeLabel(props.definition.property, code),
        })),
  )
</script>

<template>
  <FormField
    v-if="definition.shape === 'date'"
    name="date"
    :label="definition.label"
    description="按来源所写填写年份、月份或日期，例如 2012、2012-10 或 2012-10-26"
    description-placement="control"
  >
    <Input v-model="values.date" class="max-w-60" placeholder="2012-10-26" />
  </FormField>
  <Inline v-else-if="definition.shape === 'money'" gap="md" align="end">
    <FormField name="amount" :label="definition.label">
      <Input v-model="values.amount" inputmode="decimal" class="max-w-40" />
    </FormField>
    <FormField name="currency" label="币种">
      <Select v-model="values.currency" :options="CURRENCIES" class="w-28" />
    </FormField>
    <FormField name="tax" label="是否含税">
      <SegmentedControl v-model="values.tax" :options="TAX" size="sm" />
    </FormField>
  </Inline>
  <template v-else-if="definition.shape === 'credit'">
    <Inline gap="md" align="start">
      <FormField name="code" label="职能" required>
        <Select v-model="values.code" :options="codes" class="w-40" />
      </FormField>
      <FormField
        name="text"
        label="所列名称"
        required
        description="请按来源原样复制名称"
        description-placement="control"
        class="min-w-0 flex-1"
      >
        <Input v-model="values.text" />
      </FormField>
    </Inline>
    <FormField v-if="definition.reading" name="reading" label="读音">
      <Input v-model="values.reading" />
    </FormField>
    <Inline v-if="SONG_ROLES.includes(values.code)" gap="md" align="start">
      <FormField name="song" label="歌名" class="min-w-0 flex-1">
        <Input v-model="values.song" lang="ja" />
      </FormField>
      <FormField name="song_kind" label="主题歌或插入歌">
        <Select
          v-model="values.song_kind"
          :options="SONG_KINDS"
          clearable
          placeholder="未写明"
          class="w-40"
        />
      </FormField>
    </Inline>
    <FormField
      name="target"
      label="人物或组织"
      description="该名称所指人物或组织的条目"
      description-placement="control"
    >
      <CreatorEntryFormTarget
        v-model="values.target"
        :types="definition.targets"
        :selected="statement?.target"
      />
    </FormField>
  </template>
  <template v-else-if="definition.shape === 'entry'">
    <FormField name="target" :label="definition.label" required>
      <CreatorEntryFormTarget
        v-model="values.target"
        :types="definition.targets"
        :selected="statement?.target"
      />
    </FormField>
    <FormField
      v-if="definition.codes"
      name="code"
      :label="definition.property === 'INCLUDED_GAME' ? '版本类型' : '关系'"
      :required="!definition.optional_code"
      :description="
        definition.property === 'GAME_RELATION'
          ? '所选游戏与本游戏的关系；例如，当所选游戏为本游戏的续作时，请选择「续作」'
          : undefined
      "
      description-placement="control"
    >
      <Select
        v-model="values.code"
        :options="codes"
        :clearable="definition.optional_code"
        :placeholder="definition.optional_code ? '未指定' : undefined"
        class="max-w-60"
      />
    </FormField>
    <FormField v-if="definition.note" name="text" label="说明">
      <Input v-model="values.text" />
    </FormField>
  </template>
  <FormField
    v-else-if="definition.shape === 'code' || definition.shape === 'language'"
    name="code"
    :label="definition.label"
  >
    <Select v-model="values.code" :options="codes" class="max-w-60" />
  </FormField>
  <template v-else>
    <FormField name="text" :label="definition.label">
      <Textarea v-if="isLong(definition)" v-model="values.text" :rows="6" />
      <Input
        v-else
        v-model="values.text"
        :inputmode="definition.shape === 'url' ? 'url' : undefined"
      />
    </FormField>
    <FormField v-if="definition.reading" name="reading" label="读音">
      <Input v-model="values.reading" lang="ja" />
    </FormField>
  </template>
</template>

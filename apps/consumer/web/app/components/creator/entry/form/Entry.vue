<script setup lang="ts">
  import { FormField, Inline, Input, Link, Select, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import {
    ENTRY_TYPE_NAMES,
    type BackendPropertyDefinition,
    type BackendStatement,
  } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'
  import { codeLabel } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormEntry' })
  const props = defineProps<{
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
  }>()
  const values = defineModel<StatementValues>('values', { required: true })

  const names = inject(
    ENTRY_TYPE_NAMES,
    computed<Record<string, string>>(() => ({})),
  )
  const codes = computed(() =>
    (props.definition.codes ?? []).map(code => ({
      value: code,
      label: codeLabel(props.definition.property, code),
    })),
  )
  const kinds = computed(() => props.definition.property === 'INCLUDED_GAME')
  const relation = computed(() => props.definition.property === 'APPEARANCE_RELATION')
  const target = computed(() =>
    relation.value
      ? '对象'
      : props.definition.targets.map(type => names.value[type] ?? type).join('或'),
  )
</script>

<template>
  <Inline gap="md" align="start">
    <FormField
      v-if="definition.codes && !kinds && !relation"
      name="code"
      label="种类"
      :required="!definition.optional_code"
      class="w-40"
    >
      <Select
        v-model="values.code"
        variant="secondary"
        :options="codes"
        :clearable="definition.optional_code"
        :placeholder="definition.optional_code ? '未指定' : undefined"
      />
    </FormField>
    <FormField v-if="relation" name="text" label="关系" class="min-w-0 flex-1">
      <Input v-model="values.text" variant="secondary" lang="ja" placeholder="照作品中的说法填写" />
    </FormField>
    <FormField name="target" :label="target" required class="min-w-0 flex-1">
      <CreatorEntryFormTarget
        v-model="values.target"
        :types="definition.targets"
        :selected="statement?.target"
      />
    </FormField>
    <FormField v-if="kinds" name="code" class="w-48">
      <template #label>
        版本类型
        <CreatorEntryHint name="kind" class="ms-1 align-middle" />
      </template>
      <Select
        v-model="values.code"
        variant="secondary"
        :options="codes"
        clearable
        placeholder="未指定"
      />
    </FormField>
  </Inline>
  <Text v-if="definition.property === 'ADAPTATION'" as="p" size="sm" tone="muted">
    没有找到时，可以<Link :as="NuxtLink" to="/create/new" target="_blank" tone="accent"
      >新建{{ target }}</Link
    >。
  </Text>
  <FormField v-if="definition.note && !relation" name="text" label="说明">
    <Input v-model="values.text" variant="secondary" />
  </FormField>
</template>

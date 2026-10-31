<script setup lang="ts">
  import { FormField, Inline, Input, Select, Stack } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import type { StatementValues } from '~/features/creator/entry/schemas/statement.schema'
  import { codeLabel } from '~/features/creator/entry/values'
  import { SONG_KIND_LABELS, SONG_ROLES } from '~/features/entry/labels'

  defineOptions({ name: 'CreatorEntryFormCredit' })
  const props = defineProps<{
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
  }>()
  const values = defineModel<StatementValues>('values', { required: true })

  const SONG_KINDS = Object.entries(SONG_KIND_LABELS).map(([value, label]) => ({ value, label }))
  const codes = computed(() =>
    (props.definition.codes ?? []).map(code => ({
      value: code,
      label: codeLabel(props.definition.property, code),
    })),
  )
  const voice = computed(() => codes.value.length === 1 && codes.value[0]?.value === 'VOICE')
  if (voice.value && !values.value.code) values.value.code = 'VOICE'
</script>

<template>
  <Stack gap="md">
    <Inline v-if="!voice" gap="md" align="start">
      <FormField name="role" label="职责" class="min-w-0 flex-1">
        <Input v-model="values.role" variant="secondary" lang="ja" placeholder="照来源原文填写" />
      </FormField>
      <FormField name="code" required class="min-w-0 flex-1">
        <template #label>
          职责分类
          <CreatorEntryHint name="role" class="ms-1 align-middle" />
        </template>
        <Select v-model="values.code" variant="secondary" :options="codes" />
      </FormField>
    </Inline>
    <Inline gap="md" align="start">
      <FormField name="text" label="名字" required class="min-w-0 flex-1">
        <Input v-model="values.text" variant="secondary" lang="ja" placeholder="照来源原文填写" />
      </FormField>
      <FormField v-if="definition.reading" name="reading" label="读音" class="min-w-0 flex-1">
        <Input v-model="values.reading" variant="secondary" lang="ja" />
      </FormField>
    </Inline>
    <Inline v-if="SONG_ROLES.includes(values.code)" gap="md" align="start">
      <FormField name="song" label="歌名" class="min-w-0 flex-1">
        <Input v-model="values.song" variant="secondary" lang="ja" placeholder="照来源原文填写" />
      </FormField>
      <FormField name="song_kind" label="主题歌或插入歌" class="min-w-0 flex-1">
        <Select
          v-model="values.song_kind"
          variant="secondary"
          :options="SONG_KINDS"
          clearable
          placeholder="未写明"
        />
      </FormField>
    </Inline>
    <CreatorEntryFormVersions v-if="voice" v-model="values.versions" />
    <FormField name="target">
      <template #label>
        {{ voice ? '关联人物' : '关联人物或组织' }}
        <CreatorEntryHint name="link" class="ms-1 align-middle" />
      </template>
      <CreatorEntryFormTarget
        v-model="values.target"
        :types="definition.targets"
        :selected="statement?.target"
      />
    </FormField>
  </Stack>
</template>

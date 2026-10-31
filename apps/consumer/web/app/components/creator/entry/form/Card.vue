<script setup lang="ts">
  import { Button, Card, Form, FormField, Inline, Input, Stack, Text } from '@hina-ui/vue'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
  } from '~/features/creator/entry/contract'
  import { statementSchema } from '~/features/creator/entry/schemas/statement.schema'
  import { useStatementEdit } from '~/features/creator/entry/useStatementEdit'
  import { revisionTime } from '~/features/entry/time'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormCard' })
  const props = defineProps<{
    entry: { id: number; revision: number; type: string }
    definition: BackendPropertyDefinition
    statement: BackendStatement | null
    code?: string
  }>()
  const emit = defineEmits<{ cancel: []; saved: [] }>()

  const edit = useStatementEdit({
    entry: props.entry,
    definition: props.definition,
    statement: props.statement,
    code: props.code,
  })
  const { values, check, checking, saving, blocked, retryAt } = edit
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const deprecating = ref(false)
  const root = useTemplateRef<InstanceType<typeof Card>>('root')
  onMounted(() => root.value?.$el?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }))
  const unpublished = computed(
    () =>
      props.entry.type === 'APPEARANCE' &&
      values.method === 'screenshot' &&
      props.definition.work_content &&
      Boolean(values.version && values.location),
  )
  const incomplete = computed(
    () =>
      values.method === 'screenshot' &&
      props.definition.work_content &&
      edit.shots.value.length > 0 &&
      !(values.version && values.location),
  )

  watchDebounced(
    () => [
      values.text,
      values.code,
      values.role,
      values.original,
      values.archive,
      values.machine,
      values.language,
      values.versions.join(),
      values.date,
      values.amount,
      values.currency,
      values.tax,
      values.excerpt,
      values.target,
      values.reading,
      values.part,
      values.period_from,
      values.period_to,
      values.method,
      values.version,
      values.location,
      edit.shots.value.length,
      edit.extras.value.length,
    ],
    () => edit.verify(),
    { debounce: 500, immediate: true },
  )
  watch(edit.source, () => edit.verify())

  const mine = computed(() => {
    const value = edit.value.value
    if (!value) return ''
    if (props.definition.shape === 'entry') return props.statement?.target?.label ?? ''
    return statementText({ ...value, target: null, property: props.definition.property })
  })
  function limitText(limit: NonNullable<typeof retryAt.value>) {
    const wait = Math.max(1, Math.ceil((Date.parse(limit.at) - Date.now()) / 1000))
    const span = limit.seconds === 60 ? '每分钟' : limit.seconds ? `每 ${limit.seconds} 秒` : null
    const rule =
      span && limit.limit ? `${limit.fresh ? '新成员' : ''}${span}最多保存 ${limit.limit} 次，` : ''
    return wait > 120
      ? `${rule}请在 ${revisionTime(limit.at)} 后保存。`
      : `${rule}请在 ${wait} 秒后保存。`
  }

  async function onSubmit() {
    if (blocked.value) return
    if (await edit.save()) emit('saved')
  }
</script>

<template>
  <Card ref="root" :padded="false" class="border-line-strong p-4 shadow-none">
    <Form
      ref="form"
      :values="values"
      :rules="statementSchema"
      :disabled="saving"
      @submit="onSubmit"
    >
      <Stack gap="md">
        <CreatorEntryFormValue
          v-model:values="values"
          :definition="definition"
          :statement="statement"
          :fixed="code"
        />
        <CreatorEntryFormQualifiers v-model:values="values" :definition="definition" />
        <CreatorEntryFormSource
          v-if="definition.sources.length"
          v-model:values="values"
          v-model:shots="edit.shots.value"
          :source="edit.source.value"
          :reading="edit.reading.value"
          :definition="definition"
          :statement="statement"
          :uploading="edit.uploading.value"
          @read="edit.read()"
          @upload="files => edit.upload(files)"
        />
        <CreatorEntryFormOthers
          v-model="edit.extras.value"
          :entry="entry"
          :definition="definition"
          :source="edit.source.value"
          :citations="edit.citations.value"
        />
        <CreatorEntryFormCheck
          :check="check"
          :checking="checking"
          :definition="definition"
          :refusal="edit.refusal.value"
          :source="edit.source.value"
          :entry-type="entry.type"
          :unpublished="unpublished"
          :incomplete="incomplete"
          :screenshot="values.method === 'screenshot'"
          :target="
            statement?.target && statement.target.id === values.target
              ? statement.target.label
              : null
          "
          @adopt="edit.adopt()"
        />
        <CreatorEntryFormConflict
          v-if="check?.conflicts.length"
          :entry-id="entry.id"
          :statements="check.conflicts.flatMap(item => item.statements)"
          :definition="definition"
          :mine="mine"
          @keep="emit('saved')"
          @mine="revision => edit.rebase(revision)"
        />
        <Stack v-if="check?.summary" gap="xs">
          <Text as="span" size="sm" weight="medium">编辑摘要</Text>
          <Text as="p" size="sm" tone="muted">{{ check.summary }}</Text>
          <FormField name="note">
            <Input
              v-model="values.note"
              variant="secondary"
              size="sm"
              placeholder="补充说明（可选）"
              aria-label="补充说明"
            />
          </FormField>
        </Stack>
        <Inline gap="sm" align="center" class="border-t border-line pt-4">
          <Button
            v-if="statement"
            variant="ghost"
            tone="neutral"
            size="sm"
            :disabled="saving"
            @click="deprecating = true"
          >
            作废此值
          </Button>
          <Inline gap="sm" align="center" class="ms-auto">
            <Text v-if="retryAt" as="span" size="xs" tone="danger">
              {{ limitText(retryAt) }}
            </Text>
            <Button
              variant="ghost"
              tone="neutral"
              size="sm"
              :disabled="saving"
              @click="emit('cancel')"
            >
              取消
            </Button>
            <Button size="sm" :loading="saving" :disabled="blocked" @click="form?.submit()">
              {{ edit.extras.value.length ? `保存 ${edit.extras.value.length + 1} 项` : '保存' }}
            </Button>
          </Inline>
        </Inline>
      </Stack>
    </Form>
    <CreatorEntryDeprecate
      v-if="statement"
      v-model:open="deprecating"
      :entry="entry"
      :definition="definition"
      :statement="statement"
      @saved="emit('saved')"
    />
  </Card>
</template>

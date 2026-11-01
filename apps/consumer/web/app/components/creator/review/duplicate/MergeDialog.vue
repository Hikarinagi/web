<script setup lang="ts">
  import {
    Button,
    Dialog,
    FormField,
    Grid,
    SegmentedControl,
    Skeleton,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import { TITLE_FIELDS, type BackendDuplicateCandidate } from '~/features/creator/duplicates'
  import { EDITOR_PRESENTATIONS } from '~/features/creator/editor/presentation'
  import { RESOURCE_SLUG } from '~/features/creator/labels'
  import type { CheckEntityChoice } from '~/features/creator/check'

  type FieldPlan = ApiData<
    '/api/v3/change-requests/{id}/merge-into/preview',
    'get'
  >['fields'][number]

  const props = defineProps<{
    changeRequest: BackendChangeRequestDetail
    target: BackendDuplicateCandidate
    entityChoices?: CheckEntityChoice[]
  }>()
  const open = defineModel<boolean>('open', { default: false })
  const emit = defineEmits<{ merged: [] }>()

  const slug = computed(() => RESOURCE_SLUG[props.changeRequest.resource_type] ?? '')
  const titles = computed(() => TITLE_FIELDS[slug.value])
  const fields = ref<FieldPlan[]>([])
  const choices = ref<Record<string, string>>({})
  const body = ref('')
  const loading = ref(false)
  const merging = ref(false)

  const settled = computed(() => {
    const entities = props.changeRequest.check?.verification?.entities ?? []
    return new Map(
      (props.entityChoices ?? []).flatMap(choice => {
        const entity = entities.find(item => item.change_request_id === choice.change_request_id)
        return (entity?.fields ?? []).map(field => [field, choice.use_id] as const)
      }),
    )
  })
  const rows = computed(() =>
    fields.value.filter(
      plan =>
        !empty(plan.loser_value) &&
        JSON.stringify(plan.loser_value) !== JSON.stringify(plan.canonical_value) &&
        settled.value.get(plan.field) !== (plan.canonical_value as unknown),
    ),
  )
  const chineseEmpty = computed(() => {
    const field = titles.value?.chinese
    return !!field && empty(fields.value.find(plan => plan.field === field)?.canonical_value)
  })
  const coverCount = computed(
    () =>
      props.changeRequest.payload.filter(
        op => op.kind === 'relation_add' && op.relation === 'covers',
      ).length,
  )

  watch(
    open,
    async next => {
      if (!next) return
      fields.value = []
      choices.value = {}
      body.value = ''
      loading.value = true
      try {
        const data = await hikariRequest('/api/v3/change-requests/{id}/merge-into/preview', {
          path: { id: props.changeRequest.id },
          query: { target_id: props.target.id },
        })
        fields.value = data.fields
        choices.value = Object.fromEntries(
          data.fields.map(plan => [plan.field, plan.suggested_side ?? plan.resolved]),
        )
        if (titles.value) choices.value[titles.value.original] = 'alias'
      } finally {
        loading.value = false
      }
    },
    { immediate: true },
  )

  function empty(value: unknown) {
    return value == null || value === '' || (Array.isArray(value) && value.length === 0)
  }

  function display(value: unknown): string {
    if (empty(value)) return '—'
    if (Array.isArray(value)) return value.map(display).join('、')
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  function shown(plan: FieldPlan, side: 'canonical' | 'loser'): string {
    if (side === 'loser') {
      const op = props.changeRequest.payload.find(
        item => item.kind === 'scalar' && item.field === plan.field,
      )
      if (typeof op?.to_name === 'string') return op.to_name
      return display(plan.loser_value)
    }
    if (plan.field === 'bunko_id' && props.target.label) return props.target.label
    if (plan.field === 'author_id' && props.target.author) return props.target.author
    return display(plan.canonical_value)
  }

  function options(plan: FieldPlan) {
    if (plan.field === titles.value?.original) {
      return [
        { label: '添加为别名', value: 'alias' },
        ...(chineseEmpty.value ? [{ label: '用作中文名', value: 'chinese' }] : []),
      ]
    }
    if (plan.resolved === 'union') return []
    return [
      { label: '保留现有值', value: 'canonical' },
      { label: '采用请求中的值', value: 'loser' },
    ]
  }

  function label(field: string) {
    return EDITOR_PRESENTATIONS[slug.value]?.fields[field]?.label ?? field
  }

  async function onMerge() {
    if (merging.value) return
    merging.value = true
    try {
      await hikariRequest('/api/v3/change-requests/{id}/merge-into', {
        method: 'POST',
        path: { id: props.changeRequest.id },
        body: {
          target_id: props.target.id,
          field_choices: rows.value
            .filter(
              plan =>
                choices.value[plan.field] === 'canonical' || choices.value[plan.field] === 'loser',
            )
            .map(plan => ({
              field: plan.field,
              side: choices.value[plan.field] as 'canonical' | 'loser',
            })),
          title_as_chinese: titles.value
            ? choices.value[titles.value.original] === 'chinese'
            : false,
          ...(props.entityChoices?.length ? { entity_choices: props.entityChoices } : {}),
          body: body.value.trim() || undefined,
        },
      })
      open.value = false
      emit('merged')
    } finally {
      merging.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="`并入 #${target.id} ${target.title}`"
    size="lg"
    :locked="merging"
    class="max-w-5xl"
  >
    <template #content>
      <Stack gap="md">
        <Text size="sm" tone="muted">
          不会新建条目。所选值将作为一次修订写入 #{{
            target.id
          }}，且此变更请求将标记为已并入该条目。
        </Text>
        <Skeleton v-if="loading" class="h-40 w-full" />
        <Grid v-else :cols="4" gap="sm" class="items-center">
          <Text size="xs" tone="muted">字段</Text>
          <Text size="xs" tone="muted">当前 #{{ target.id }}</Text>
          <Text size="xs" tone="muted">本次请求</Text>
          <Text size="xs" tone="muted">结果</Text>
          <template v-for="plan in rows" :key="plan.field">
            <Text size="sm">{{ label(plan.field) }}</Text>
            <Text size="sm" tone="muted" class="break-all">{{ shown(plan, 'canonical') }}</Text>
            <Text size="sm" class="break-all">{{ shown(plan, 'loser') }}</Text>
            <SegmentedControl
              v-if="options(plan).length"
              v-model="choices[plan.field]"
              :options="options(plan)"
              size="sm"
            />
            <Text v-else size="sm" class="break-all">{{ display(plan.value) }}</Text>
          </template>
          <template v-if="coverCount">
            <Text size="sm">封面</Text>
            <Text size="sm" tone="muted">—</Text>
            <Text size="sm">{{ coverCount }} 张图片</Text>
            <Text size="sm">添加为候选封面</Text>
          </template>
        </Grid>
        <FormField label="给提交者的备注">
          <Textarea v-model="body" autosize />
        </FormField>
      </Stack>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="merging" @click="open = false">取消</Button>
      <Button :loading="merging" :disabled="loading" @click="onMerge">并入并通过</Button>
    </template>
  </Dialog>
</template>

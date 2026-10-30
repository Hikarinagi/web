<script setup lang="ts">
  import {
    Alert,
    Button,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Divider,
    Heading,
    Panel,
    Spinner,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import {
    ENTRY_TYPE_NAMES,
    type BackendEditCheck,
    type BackendEntryDefinition,
    type BackendEntryDraft,
    type BackendStatement,
  } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorNewDraft' })
  const props = defineProps<{
    draft: BackendEntryDraft | null
    check: BackendEditCheck | null
    failures: string[]
    definitions: BackendEntryDefinition[]
    from: string | null
    drafting: boolean
    ready: boolean
    saving: boolean
  }>()
  defineEmits<{ create: [] }>()

  const names = inject(
    ENTRY_TYPE_NAMES,
    computed<Record<string, string>>(() => ({})),
  )
  const FAILURES: Record<string, string> = {
    EXCERPT_NOT_FOUND: '页面上未找到该名称',
    SOURCE_NOT_ALLOWED: '该页面不能作为此条目类型的来源',
    UNREACHABLE: '无法打开该页面。请检查地址，或稍后重试。',
  }
  const messages = computed(() => [
    ...props.failures.map(item => FAILURES[item] ?? item),
    ...(props.check?.violations ?? []).map(violation => {
      const label =
        props.definitions
          .flatMap(item => item.properties)
          .find(item => item.property === violation.property)?.label ?? violation.property
      return violation.reason === 'duplicate' ? `${label}已被其他条目使用` : `${label}仅可取一个值`
    }),
  ])
  const cards = computed(() => {
    const operations = props.draft?.operations ?? []
    const titles = new Map(
      operations.flatMap(operation =>
        operation.op === 'add' &&
        operation.entry_ref &&
        ['TITLE', 'NAME'].includes(operation.property ?? '')
          ? [[operation.entry_ref, operation.value?.text ?? ''] as const]
          : [],
      ),
    )
    return operations.flatMap(operation => {
      if (operation.op !== 'create_entry' || !operation.ref || !operation.type) return []
      const labels = new Map(
        (props.definitions.find(item => item.type === operation.type)?.properties ?? []).map(
          item => [item.property, item.label],
        ),
      )
      const values = operations.flatMap(item => {
        if (item.op !== 'add' || item.entry_ref !== operation.ref || !item.property) return []
        const { target, target_ref, ...value } = item.value ?? {}
        const label =
          target_ref !== undefined
            ? titles.get(target_ref)
            : target === props.draft?.target?.id
              ? props.draft?.target?.label
              : undefined
        return [
          {
            label: labels.get(item.property) ?? item.property,
            text: statementText({
              ...(value as Partial<BackendStatement>),
              property: item.property,
              target: label === undefined ? null : ({ label } as BackendStatement['target']),
            }),
          },
        ]
      })
      return [{ ref: operation.ref, type: names.value[operation.type] ?? operation.type, values }]
    })
  })
</script>

<template>
  <Panel title="待新建的条目" :description="from ? `取自 ${from}` : undefined">
    <Stack gap="lg">
      <slot />
      <Spinner v-if="drafting" size="sm" />
      <template v-for="card in cards" :key="card.ref">
        <Divider />
        <Stack gap="sm">
          <Heading :level="3" size="sm">{{ card.type }}</Heading>
          <DescriptionList orientation="horizontal" class="text-sm">
            <template v-for="(value, index) in card.values" :key="index">
              <DescriptionTerm>{{ value.label }}</DescriptionTerm>
              <DescriptionDetails>
                <Text as="span" size="sm" lang="ja">{{ value.text }}</Text>
              </DescriptionDetails>
            </template>
          </DescriptionList>
        </Stack>
      </template>
      <Alert :open="Boolean(messages.length)" tone="danger" title="该条目尚无法创建">
        {{ messages.join('；') }}
      </Alert>
      <Button :disabled="!ready" :loading="saving" class="self-end" @click="$emit('create')">
        新建
      </Button>
    </Stack>
  </Panel>
</template>

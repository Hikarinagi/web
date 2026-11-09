<script setup lang="ts">
  import { CloseButton, Inline, Input, MultiSelect, Select, Stack, Text } from '@hina-ui/vue'
  import { LANGUAGE_LABELS } from '~/features/galgame/labels'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { dateInput, parseDate, type QualifierKind } from '~/features/wiki/editor/inputs'

  defineOptions({ name: 'WikiFieldQualifiers' })

  const props = defineProps<{ versions: NonNullable<ValueDraft['target']>[] }>()
  const model = defineModel<ValueDraft>({ required: true })
  const shown = defineModel<QualifierKind[]>('shown', { required: true })

  const patch = (fields: Partial<ValueDraft>) => (model.value = { ...model.value, ...fields })
  const languages = Object.entries(LANGUAGE_LABELS).map(([value, label]) => ({ value, label }))
  const versionOptions = computed(() =>
    props.versions.map(item => ({ value: item.id, label: item.label })),
  )

  function date(side: 'from' | 'to', text: string) {
    const parsed = parseDate(text)
    patch(
      side === 'from'
        ? { period_from: parsed.date, period_from_precision: parsed.precision }
        : { period_to: parsed.date, period_to_precision: parsed.precision },
    )
  }

  function drop(kind: QualifierKind) {
    shown.value = shown.value.filter(item => item !== kind)
    if (kind === 'period')
      patch({
        period_from: null,
        period_from_precision: null,
        period_to: null,
        period_to_precision: null,
      })
    if (kind === 'version') patch({ versions: [] })
    if (kind === 'part') patch({ part: null })
    if (kind === 'language') patch({ language: null })
  }

  function pickVersions(ids: (string | number)[]) {
    patch({ versions: props.versions.filter(item => ids.map(Number).includes(item.id)) })
  }
</script>

<template>
  <Stack v-if="shown.length" gap="xs">
    <Inline v-if="shown.includes('period')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">期间</Text>
      <Input
        :model-value="dateInput(model.period_from, model.period_from_precision)"
        aria-label="期间开始"
        placeholder="开始"
        class="min-w-0 flex-1"
        @update:model-value="value => date('from', String(value))"
      />
      <Text as="span" size="sm" tone="muted">至</Text>
      <Input
        :model-value="dateInput(model.period_to, model.period_to_precision)"
        aria-label="期间结束"
        placeholder="结束"
        class="min-w-0 flex-1"
        @update:model-value="value => date('to', String(value))"
      />
      <CloseButton label="去掉期间" @click="drop('period')" />
    </Inline>
    <Inline v-if="shown.includes('version')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">适用版本</Text>
      <MultiSelect
        :model-value="model.versions.map(item => item.id)"
        :options="versionOptions"
        aria-label="适用版本"
        placeholder="选择版本"
        class="min-w-0 flex-1"
        @update:model-value="pickVersions"
      />
      <CloseButton label="去掉适用版本" @click="drop('version')" />
    </Inline>
    <Inline v-if="shown.includes('part')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">适用部分</Text>
      <Input
        :model-value="model.part ?? ''"
        aria-label="适用部分"
        class="min-w-0 flex-1"
        @update:model-value="value => patch({ part: String(value) || null })"
      />
      <CloseButton label="去掉适用部分" @click="drop('part')" />
    </Inline>
    <Inline v-if="shown.includes('language')" gap="sm" align="center" :wrap="false">
      <Text as="span" size="sm" tone="muted" class="w-16 shrink-0">语言</Text>
      <Select
        :model-value="model.language"
        :options="languages"
        aria-label="语言"
        class="min-w-0 flex-1"
        @update:model-value="value => patch({ language: value ? String(value) : null })"
      />
      <CloseButton label="去掉语言" @click="drop('language')" />
    </Inline>
  </Stack>
</template>

<script setup lang="ts">
  import {
    Inline,
    SegmentedControl,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { checkFieldLabel, type BackendCheckField } from '~/features/creator/check'

  const props = defineProps<{
    fields: BackendCheckField[]
    resourceType: string
    selectable: boolean
  }>()
  const choices = defineModel<Record<string, 'request' | 'original'>>('choices', { required: true })

  const OPTIONS = [
    { label: '请求', value: 'request' },
    { label: '原版', value: 'original' },
  ]

  const label = (field: BackendCheckField) => checkFieldLabel(field.field, props.resourceType)
  const replaced = (field: BackendCheckField) =>
    props.selectable && choices.value[field.field] === 'original' && field.submitted_display != null

  function choose(field: BackendCheckField, value: string | number | undefined) {
    if (value === 'request' || value === 'original') {
      choices.value = { ...choices.value, [field.field]: value }
    }
  }
</script>

<template>
  <Table variant="secondary" :hover="false" class="hidden md:table">
    <TableHeader>
      <TableRow>
        <TableHead>字段</TableHead>
        <TableHead>请求</TableHead>
        <TableHead>原版</TableHead>
        <TableHead>来源</TableHead>
        <TableHead v-if="selectable">采用</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow v-for="field in fields" :key="field.field">
        <TableCell>
          <Text as="span" size="sm" tone="muted">{{ label(field) }}</Text>
        </TableCell>
        <TableCell>
          <Text
            as="span"
            size="sm"
            :tone="replaced(field) ? 'muted' : undefined"
            :class="replaced(field) ? 'line-through' : ''"
          >
            {{ field.submitted_display ?? '—' }}
          </Text>
        </TableCell>
        <TableCell>
          <Text as="span" size="sm" weight="medium">{{ field.display }}</Text>
        </TableCell>
        <TableCell>
          <Inline gap="xs" align="center">
            <CreatorReviewCheckSource v-if="field.source" :source="field.source" />
            <Tag size="sm" tone="success">已核实</Tag>
          </Inline>
        </TableCell>
        <TableCell v-if="selectable">
          <SegmentedControl
            size="sm"
            :options="OPTIONS"
            :model-value="choices[field.field] ?? 'request'"
            :aria-label="label(field)"
            @update:model-value="choose(field, $event)"
          />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>

  <Stack gap="none" class="md:hidden">
    <Stack v-for="field in fields" :key="field.field" gap="xs" class="border-t border-line py-3">
      <Text size="sm" tone="muted" weight="medium">{{ label(field) }}</Text>
      <Inline gap="sm" :wrap="false">
        <Text as="span" size="sm" tone="muted" class="w-10 shrink-0">请求</Text>
        <Text as="span" size="sm" :class="replaced(field) ? 'text-muted line-through' : ''">
          {{ field.submitted_display ?? '—' }}
        </Text>
      </Inline>
      <Inline gap="sm" :wrap="false">
        <Text as="span" size="sm" tone="muted" class="w-10 shrink-0">原版</Text>
        <Text as="span" size="sm" weight="medium">{{ field.display }}</Text>
      </Inline>
      <Inline gap="xs" align="center">
        <CreatorReviewCheckSource v-if="field.source" :source="field.source" />
        <Tag size="sm" tone="success">已核实</Tag>
      </Inline>
      <SegmentedControl
        v-if="selectable"
        block
        :options="OPTIONS"
        :model-value="choices[field.field] ?? 'request'"
        :aria-label="label(field)"
        @update:model-value="choose(field, $event)"
      />
    </Stack>
  </Stack>
</template>

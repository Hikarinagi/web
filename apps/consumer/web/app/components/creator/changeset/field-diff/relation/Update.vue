<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { ArrowRight } from '@lucide/vue'
  import { asRecord, asRefValues, attrKeyLabel, attrValueLabel, REF_ATTR_LABEL } from '../helpers'

  const props = defineProps<{
    op: Record<string, unknown>
  }>()

  const targetName = computed(() =>
    typeof props.op.target_name === 'string' ? props.op.target_name : '',
  )
  const targetCover = computed(() =>
    typeof props.op.target_cover === 'string' && props.op.target_cover ? props.op.target_cover : '',
  )
  const updates = computed(() =>
    Object.entries(asRecord(props.op.attributes)).map(([key, change]) => {
      const record = asRecord(change)
      return { key, from: record.from, to: record.to }
    }),
  )
  const refUpdates = computed(() =>
    Object.entries(asRecord(props.op.ref_attributes)).map(([key, change]) => {
      const record = asRecord(change)
      const from = asRefValues(record.from)
      const to = asRefValues(record.to)
      const fromIds = new Set(from.map(v => v.id))
      const toIds = new Set(to.map(v => v.id))
      return {
        key,
        label: REF_ATTR_LABEL[key] ?? key,
        added: to.filter(v => !fromIds.has(v.id)),
        removed: from.filter(v => !toIds.has(v.id)),
      }
    }),
  )
</script>

<template>
  <Stack as="ul" gap="xs">
    <Inline as="li" gap="sm" align="center">
      <HikariImage
        v-if="targetCover"
        :src="targetCover"
        alt=""
        preset="small"
        class="size-10 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <Text v-if="targetName" as="span" size="sm" weight="medium">{{ targetName }}</Text>
      <Text as="span" size="xs" tone="muted" class="font-mono">#{{ op.target_id }}</Text>
    </Inline>

    <Inline v-for="change in updates" :key="change.key" as="li" gap="sm" align="center">
      <Text as="span" size="xs" tone="muted">{{ attrKeyLabel(change.key) }}</Text>
      <Text as="span" class="rounded bg-danger-soft px-2 py-1 text-danger-text line-through">
        {{ attrValueLabel(op, change.key, change.from) }}
      </Text>
      <ArrowRight class="size-3.5 shrink-0 text-muted" aria-hidden="true" />
      <Text as="span" class="rounded bg-success-soft px-2 py-1 text-success-text">
        {{ attrValueLabel(op, change.key, change.to) }}
      </Text>
    </Inline>

    <Inline v-for="ref in refUpdates" :key="`ref-${ref.key}`" as="li" gap="sm" align="center">
      <Text as="span" size="xs" tone="muted">{{ ref.label }}</Text>
      <CreatorChangesetFieldDiffRelationRefList
        v-if="ref.removed.length"
        :values="ref.removed"
        variant="remove"
      />
      <CreatorChangesetFieldDiffRelationRefList
        v-if="ref.added.length"
        :values="ref.added"
        variant="add"
      />
    </Inline>
  </Stack>
</template>

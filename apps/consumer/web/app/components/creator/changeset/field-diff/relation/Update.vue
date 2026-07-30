<script setup lang="ts">
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
  <ul class="flex flex-col gap-1.5">
    <li class="flex flex-wrap items-center gap-2">
      <HikariImage
        v-if="targetCover"
        :src="targetCover"
        alt=""
        preset="small"
        class="size-10 shrink-0 overflow-hidden rounded"
        image-class="size-full object-cover"
      />
      <span v-if="targetName" class="text-sm font-medium">{{ targetName }}</span>
      <span class="font-mono text-xs text-muted-color">#{{ op.target_id }}</span>
    </li>
    <li v-for="change in updates" :key="change.key" class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-color">{{ attrKeyLabel(change.key) }}</span>
      <span class="rounded bg-red-500/10 px-2 py-1 text-red-700 line-through dark:text-red-300">
        {{ attrValueLabel(op, change.key, change.from) }}
      </span>
      <ArrowRight :size="14" class="shrink-0 text-muted-color" aria-hidden="true" />
      <span class="rounded bg-green-500/10 px-2 py-1 text-green-700 dark:text-green-300">
        {{ attrValueLabel(op, change.key, change.to) }}
      </span>
    </li>
    <li v-for="ref in refUpdates" :key="`ref-${ref.key}`" class="flex flex-wrap items-center gap-2">
      <span class="text-xs text-muted-color">{{ ref.label }}</span>
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
    </li>
  </ul>
</template>

<script setup lang="ts">
  import { asRecord, asRefValues, attrKeyLabel, attrValueLabel, REF_ATTR_LABEL } from '../helpers'

  const props = defineProps<{
    op: Record<string, unknown>
    variant: 'add' | 'remove'
  }>()

  const targetName = computed(() =>
    typeof props.op.target_name === 'string' ? props.op.target_name : '',
  )
  const targetCover = computed(() =>
    typeof props.op.target_cover === 'string' && props.op.target_cover ? props.op.target_cover : '',
  )
  const attrs = computed(() => Object.entries(asRecord(props.op.attributes)))
  const refLists = computed(() =>
    Object.entries(asRecord(props.op.ref_attributes))
      .map(([key, values]) => ({
        key,
        label: REF_ATTR_LABEL[key] ?? key,
        values: asRefValues(values),
      }))
      .filter(entry => entry.values.length > 0),
  )
</script>

<template>
  <div
    class="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg px-3 py-2"
    :class="
      variant === 'add'
        ? 'bg-green-500/10 text-green-700 dark:text-green-300'
        : 'bg-red-500/10 text-red-700 line-through dark:text-red-300'
    "
  >
    <HikariImage
      v-if="targetCover"
      :src="targetCover"
      alt=""
      preset="small"
      class="size-10 shrink-0 overflow-hidden rounded"
      image-class="size-full object-cover"
    />
    <span v-if="targetName" class="text-sm font-medium">{{ targetName }}</span>
    <span class="font-mono text-xs opacity-70">#{{ op.target_id }}</span>
    <span v-for="[key, value] in attrs" :key="key" class="text-xs">
      {{ attrKeyLabel(key) }}:{{ attrValueLabel(op, key, value) }}
    </span>
    <template v-for="ref in refLists" :key="ref.key">
      <span class="text-xs">{{ ref.label }}:</span>
      <CreatorChangesetFieldDiffRelationRefList :values="ref.values" variant="plain" />
    </template>
  </div>
</template>

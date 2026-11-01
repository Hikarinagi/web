<script setup lang="ts">
  import { Inline, Text } from '@hina-ui/vue'
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
  <Inline
    gap="sm"
    align="center"
    class="rounded-lg px-3 py-2"
    :class="
      variant === 'add'
        ? 'bg-success-soft text-success-text'
        : 'bg-danger-soft text-danger-text line-through'
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
    <Text v-if="targetName" as="span" size="sm" weight="medium" class="text-inherit">
      {{ targetName }}
    </Text>
    <Text as="span" size="xs" class="font-mono text-inherit opacity-70">#{{ op.target_id }}</Text>
    <Text v-for="[key, value] in attrs" :key="key" as="span" size="xs" class="text-inherit">
      {{ attrKeyLabel(key) }}:{{ attrValueLabel(op, key, value) }}
    </Text>
    <template v-for="ref in refLists" :key="ref.key">
      <Text as="span" size="xs" class="text-inherit">{{ ref.label }}:</Text>
      <CreatorChangesetFieldDiffRelationRefList :values="ref.values" variant="plain" />
    </template>
  </Inline>
</template>

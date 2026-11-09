<script setup lang="ts">
  import { Stack, Text } from '@hina-ui/vue'
  import {
    DEPRECATION_REASONS,
    LONG_PROPERTIES,
    qualifierText,
    sourceText,
    valueText,
    type ComparedStatement,
    type WikiProperty,
  } from '~/features/wiki/values'

  defineOptions({ name: 'WikiDiffValue' })

  const props = defineProps<{
    property: WikiProperty
    before: ComparedStatement | null
    after: ComparedStatement | null
    kept?: boolean
  }>()

  const describe = (statement: ComparedStatement | null) => {
    if (!statement) return ''
    const qualifier = qualifierText(statement)
    return `${valueText(statement)}${qualifier ? `（${qualifier}）` : ''}`
  }
  const removed = (statement: ComparedStatement | null) => statement?.status === 'DEPRECATED'
  const shown = computed(() => ({
    before: removed(props.before) ? '' : describe(props.before),
    after: removed(props.after) ? '' : describe(props.after),
  }))
  const note = computed(() => {
    const reason = props.after?.deprecation_reason
    if (removed(props.after) && !removed(props.before))
      return reason ? `已删除，${DEPRECATION_REASONS[reason] ?? reason}` : '已删除'
    if (removed(props.before) && !removed(props.after)) return '已恢复'
    return null
  })
  const sources = computed(() => {
    const before = props.before ? sourceText(props.before) : ''
    const after = props.after ? sourceText(props.after) : ''
    return before === after ? null : { before, after }
  })
  const images = computed(() => Boolean(props.before?.media ?? props.after?.media))
  const long = computed(() => LONG_PROPERTIES.includes(props.property))
  const unchanged = computed(
    () => !long.value && shown.value.before === shown.value.after && !note.value,
  )
</script>

<template>
  <Stack gap="xs" class="min-w-0 wrap-anywhere">
    <WikiDiffImages
      v-if="images"
      :before="before?.media ?? null"
      :after="removed(after) ? null : (after?.media ?? null)"
    />
    <WikiDiffLines
      v-else-if="long"
      :before="before?.text ?? ''"
      :after="removed(after) ? '' : (after?.text ?? '')"
    />
    <Text v-else-if="unchanged || (!shown.before && !shown.after)" size="sm">
      {{ shown.after || describe(after ?? before) }}
    </Text>
    <WikiDiffText v-else :before="shown.before" :after="shown.after" />
    <Text v-if="note" size="xs" tone="muted">{{ note }}</Text>
    <Text v-if="kept" size="xs" tone="danger">此后已有新的修改，此处保持不变</Text>
    <Text v-if="sources" size="xs" tone="muted">
      来源：{{ sources.before || '无' }} → {{ sources.after || '无' }}
    </Text>
  </Stack>
</template>

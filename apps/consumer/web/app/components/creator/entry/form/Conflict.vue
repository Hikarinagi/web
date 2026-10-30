<script setup lang="ts">
  import { Button, Inline, Spinner, Stack, Text } from '@hina-ui/vue'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'
  import { statementText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormConflict' })
  const props = defineProps<{
    entryId: number
    statements: number[]
    definition: BackendPropertyDefinition
  }>()
  const emit = defineEmits<{ keep: []; mine: [revision: number] }>()

  const fresh = ref<BackendEditableEntry | null>(null)
  const theirs = computed(
    () => fresh.value?.statements.filter(item => props.statements.includes(item.id)) ?? [],
  )

  onMounted(async () => {
    fresh.value = await hikariRequest('/api/v3/wiki/entries/{id}', { path: { id: props.entryId } })
  })
</script>

<template>
  <Stack gap="sm" class="rounded-lg bg-warning-soft p-4">
    <Text as="p" size="sm" weight="medium">{{ definition.label }}已被他人更改</Text>
    <Text as="p" size="sm" tone="muted">对方当前的值如下。保留对方的值，或以你的值覆盖保存。</Text>
    <Spinner v-if="!fresh" size="sm" />
    <Stack v-for="statement in theirs" :key="statement.id" gap="xs">
      <Text
        as="span"
        size="sm"
        :class="statement.status === 'DEPRECATED' ? 'line-through' : undefined"
      >
        {{ statementText(statement) }}
      </Text>
      <Text v-if="statement.status === 'DEPRECATED'" as="span" size="xs" tone="muted">
        对方已作废该值。
      </Text>
      <CreatorEntrySource v-else :statement="statement" :label="definition.label" />
    </Stack>
    <Inline gap="sm">
      <Button variant="soft" tone="neutral" size="sm" @click="emit('keep')">保留对方的值</Button>
      <Button
        variant="soft"
        size="sm"
        :disabled="!fresh"
        @click="fresh && emit('mine', fresh.revision)"
      >
        使用我的值
      </Button>
    </Inline>
  </Stack>
</template>

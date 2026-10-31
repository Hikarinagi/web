<script setup lang="ts">
  import { Alert, Inline, RadioGroup, Spinner, Stack, Text } from '@hina-ui/vue'
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
    mine: string
  }>()
  const emit = defineEmits<{ keep: []; mine: [revision: number] }>()

  const fresh = ref<BackendEditableEntry | null>(null)
  const theirs = computed(
    () => fresh.value?.statements.filter(item => props.statements.includes(item.id)) ?? [],
  )
  const editor = computed(() => theirs.value[0]?.editor ?? null)
  const OPTIONS = [
    { value: 'theirs', label: '对方的值' },
    { value: 'mine', label: '你的值' },
  ]
  const choice = ref<string | null>(null)
  watch(choice, value => {
    if (value === 'theirs') emit('keep')
    if (value === 'mine' && fresh.value) emit('mine', fresh.value.revision)
  })

  onMounted(async () => {
    fresh.value = await hikariRequest('/api/v3/wiki/entries/{id}', { path: { id: props.entryId } })
  })
</script>

<template>
  <Stack gap="md">
    <Alert open tone="warning" :title="`${definition.label}已被修改`">
      <Stack gap="xs">
        <Inline v-if="editor" gap="xs" align="center" wrap>
          <Avatar :user="editor" class="size-5!" />
          <UserName :user="editor" class="text-sm" />
          <Text as="span" size="sm">保存了新的{{ definition.label }}。</Text>
        </Inline>
        <Text as="p" size="sm">请选择要保留的值。</Text>
      </Stack>
    </Alert>
    <Spinner v-if="!fresh" size="sm" />
    <RadioGroup v-else v-model="choice" :options="OPTIONS" aria-label="要保留的值">
      <template #option="{ option }">
        <Stack v-if="option.value === 'theirs'" gap="xs" class="min-w-0">
          <Text as="span" size="xs" tone="muted">对方的值</Text>
          <Stack v-for="statement in theirs" :key="statement.id" gap="xs">
            <Text
              as="span"
              :class="statement.status === 'DEPRECATED' ? 'line-through' : undefined"
              lang="ja"
            >
              {{ statementText(statement) }}
            </Text>
            <Text v-if="statement.status === 'DEPRECATED'" as="span" size="xs" tone="muted">
              对方已作废此值。
            </Text>
            <CreatorEntrySource v-else :statement="statement" />
          </Stack>
        </Stack>
        <Stack v-else gap="xs" class="min-w-0">
          <Text as="span" size="xs" tone="muted">你的值</Text>
          <Text as="span" lang="ja">{{ mine }}</Text>
        </Stack>
      </template>
    </RadioGroup>
  </Stack>
</template>

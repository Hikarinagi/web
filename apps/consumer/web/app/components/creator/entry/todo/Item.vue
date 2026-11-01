<script setup lang="ts">
  import { Button, Card, Heading, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
    BackendStatement,
    BackendTodo,
  } from '~/features/creator/entry/contract'
  import { clueOf, todoText } from '~/features/creator/entry/todos'
  import { accessedText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryTodoItem' })
  const props = defineProps<{
    todo: BackendTodo
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
  }>()
  const emit = defineEmits<{ fix: [statement: BackendStatement]; saved: [] }>()

  const text = computed(() => todoText(props.todo, props.entry.statements, props.definitions))
  const clue = computed(() => clueOf(props.todo, props.entry.statements))
  const definition = computed(() =>
    props.definitions.find(item => item.property === clue.value?.property),
  )
  const others = computed(() => props.todo.entries.filter(item => item.id !== props.entry.id))
  const dismissing = ref(false)
  const deprecating = ref(false)
  const accepting = ref(false)

  async function accept() {
    accepting.value = true
    try {
      await hikariRequest('/api/v3/wiki/todos/{id}/acceptance', {
        method: 'POST',
        path: { id: props.todo.id },
        body: {},
      })
      emit('saved')
    } finally {
      accepting.value = false
    }
  }
</script>

<template>
  <Card>
    <Stack gap="md">
      <Inline gap="md" align="start" justify="between">
        <Heading :level="3" size="base">{{ text }}</Heading>
        <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
          <Avatar :user="todo.created_by" class="size-6!" />
          <UserName :user="todo.created_by" class="text-sm" />
          <Text as="span" size="xs" tone="muted">{{ accessedText(todo.created_at) }}</Text>
        </Inline>
      </Inline>
      <Text v-if="todo.problem" as="p" size="sm" tone="muted">{{ todo.problem }}</Text>
      <Inline v-if="others.length" gap="sm" wrap>
        <Link
          v-for="item in others"
          :key="item.id"
          :as="NuxtLink"
          :to="`/create/edit/entry/${item.id}`"
          tone="accent"
          class="text-sm"
          lang="ja"
        >
          {{ item.label }}
        </Link>
      </Inline>
      <Inline gap="sm">
        <Button v-if="clue" variant="soft" size="sm" @click="emit('fix', clue)">添加来源</Button>
        <Button
          v-if="todo.kind === 'SUGGESTED_EDIT' && todo.suggestion"
          variant="soft"
          size="sm"
          :loading="accepting"
          @click="accept"
        >
          采纳
        </Button>
        <Button
          v-if="clue && definition"
          variant="ghost"
          tone="neutral"
          size="sm"
          @click="deprecating = true"
        >
          作废
        </Button>
        <Button variant="ghost" tone="neutral" size="sm" @click="dismissing = true">驳回</Button>
      </Inline>
    </Stack>
    <CreatorEntryTodoDismiss :id="todo.id" v-model:open="dismissing" @saved="emit('saved')" />
    <CreatorEntryDeprecate
      v-if="clue && definition"
      v-model:open="deprecating"
      :entry="entry"
      :definition="definition"
      :statement="clue"
      @saved="emit('saved')"
    />
  </Card>
</template>

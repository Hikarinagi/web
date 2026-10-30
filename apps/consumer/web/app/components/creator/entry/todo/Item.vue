<script setup lang="ts">
  import { Button, Inline, Link, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type {
    BackendPropertyDefinition,
    BackendStatement,
    BackendTodo,
  } from '~/features/creator/entry/contract'
  import { clueOf, todoText } from '~/features/creator/entry/todos'

  defineOptions({ name: 'CreatorEntryTodoItem' })
  const props = defineProps<{
    todo: BackendTodo
    entryId: number
    statements: BackendStatement[]
    definitions: BackendPropertyDefinition[]
  }>()
  const emit = defineEmits<{ fix: [statement: BackendStatement]; saved: [] }>()

  const text = computed(() => todoText(props.todo, props.statements, props.definitions))
  const clue = computed(() => clueOf(props.todo, props.statements))
  const others = computed(() => props.todo.entries.filter(item => item.id !== props.entryId))
  const dismissing = ref(false)
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
  <Stack gap="sm">
    <Text as="p" size="sm">{{ text }}</Text>
    <Stack v-if="others.length" gap="none">
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
    </Stack>
    <Inline gap="xs">
      <Button v-if="clue" variant="soft" size="xs" @click="emit('fix', clue)">添加来源</Button>
      <Button
        v-if="todo.kind === 'SUGGESTED_EDIT' && todo.suggestion"
        variant="soft"
        size="xs"
        :loading="accepting"
        @click="accept"
      >
        采纳
      </Button>
      <Button variant="ghost" tone="neutral" size="xs" @click="dismissing = true">驳回</Button>
    </Inline>
    <CreatorEntryTodoDismiss
      :id="todo.id"
      v-model:open="dismissing"
      :text="text"
      @saved="emit('saved')"
    />
  </Stack>
</template>

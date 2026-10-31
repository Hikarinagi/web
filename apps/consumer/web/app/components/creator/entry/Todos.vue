<script setup lang="ts">
  import { Empty, Stack } from '@hina-ui/vue'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
    BackendStatement,
    BackendTodo,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryTodos' })
  defineProps<{
    todos: { items: BackendTodo[]; meta: { total_items: number } }
    entry: BackendEditableEntry
    definitions: BackendPropertyDefinition[]
  }>()
  defineEmits<{ fix: [statement: BackendStatement]; saved: [] }>()
</script>

<template>
  <Stack v-if="todos.items.length" gap="md">
    <CreatorEntryTodoItem
      v-for="todo in todos.items"
      :key="todo.id"
      :todo="todo"
      :entry="entry"
      :definitions="definitions"
      @fix="statement => $emit('fix', statement)"
      @saved="$emit('saved')"
    />
  </Stack>
  <Empty v-else size="sm" title="该条目没有待完善事项" />
</template>

<script setup lang="ts">
  import { Divider, Empty, Panel, Stack } from '@hina-ui/vue'
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
  <Panel title="待完善" :count="todos.meta.total_items">
    <Stack v-if="todos.items.length" gap="md">
      <template v-for="(todo, index) in todos.items" :key="todo.id">
        <Divider v-if="index" />
        <CreatorEntryTodoItem
          :todo="todo"
          :entry-id="entry.id"
          :statements="entry.statements"
          :definitions="definitions"
          @fix="statement => $emit('fix', statement)"
          @saved="$emit('saved')"
        />
      </template>
    </Stack>
    <Empty v-else size="sm" title="该条目没有待完善事项" />
  </Panel>
</template>

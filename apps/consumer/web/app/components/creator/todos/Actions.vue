<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { CreatorTodosPageData } from '~~/server/api/pages/create/todos.get'

  defineOptions({ name: 'CreatorTodosActions' })
  const props = defineProps<{
    todo: CreatorTodosPageData['todos']['items'][number]
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const dismissing = ref(false)
  const accepting = ref(false)
  const fix = computed(() => {
    const statement = props.todo.statement
    return statement && statement.status !== 'DEPRECATED'
      ? `/create/edit/entry/${statement.entry_id}?fix=${statement.id}`
      : null
  })

  async function accept() {
    accepting.value = true
    try {
      await hikariRequest('/api/v3/wiki/todos/{id}/acceptance', {
        method: 'POST',
        path: { id: props.todo.id },
        body: {},
      })
      emit('changed')
    } finally {
      accepting.value = false
    }
  }
</script>

<template>
  <Inline gap="xs" :wrap="false" @click.stop>
    <Button v-if="fix" :as="NuxtLink" :to="fix" variant="soft" size="xs">添加来源</Button>
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
    <CreatorEntryTodoDismiss :id="todo.id" v-model:open="dismissing" @saved="emit('changed')" />
  </Inline>
</template>

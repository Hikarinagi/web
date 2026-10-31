<script setup lang="ts">
  import { Button, Empty, Panel, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import type {
    BackendEditableEntry,
    BackendPropertyDefinition,
  } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryCreditsTab' })
  const props = defineProps<{
    entry: BackendEditableEntry
    definition: BackendPropertyDefinition
    readonly: boolean
    voice?: boolean
  }>()
  const emit = defineEmits<{ saved: [] }>()
  const editing = defineModel<number | 'new' | null>('editing', { default: null })

  const statements = computed(() =>
    props.entry.statements
      .filter(item => item.property === 'CREDIT' && item.status !== 'DEPRECATED')
      .sort((a, b) => a.position - b.position || a.id - b.id),
  )
  const done = () => {
    editing.value = null
    emit('saved')
  }
</script>

<template>
  <Panel :title="voice ? '配音' : '制作信息'" :padded="false">
    <template #title>
      {{ voice ? '配音' : '制作信息' }}
      <Text
        v-if="statements.length"
        as="span"
        size="sm"
        tone="muted"
        weight="normal"
        class="ms-1 tabular-nums"
      >
        {{ statements.length }}
      </Text>
      <CreatorEntryHint :name="voice ? 'voice' : 'credits'" class="ms-1 align-middle" />
    </template>
    <template v-if="!readonly && editing !== 'new'" #actions>
      <Button variant="ghost" tone="neutral" size="sm" @click="editing = 'new'">
        <template #icon><Plus /></template>
        {{ voice ? '添加配音' : '添加制作信息' }}
      </Button>
    </template>
    <Empty v-if="!statements.length && editing !== 'new'" size="sm" title="未填写" />
    <CreatorEntryCreditsTable
      v-else
      :statements="statements"
      :target="voice ? '关联人物' : '关联人物或组织'"
      :voice="voice"
      :entry="entry"
      :definition="definition"
      :editing="editing"
      :readonly="readonly"
      @edit="next => (editing = next)"
      @saved="done"
    />
  </Panel>
</template>

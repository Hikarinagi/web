<script setup lang="ts">
  import { Button, Dialog, FormField, Select } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EntryStatement } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiEditorMove' })

  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const router = useRouter()
  const target = ref<number | null>(null)

  const asked = computed(() => {
    const [entry, property, id] = String(route.query.move ?? '').split('|')
    const owner = Number(entry)
    const statement = Number(id)
    if (!Number.isInteger(owner) || !Number.isInteger(statement) || !property) return null
    return { owner, property: property as EntryStatement['property'], statement }
  })
  const item = computed(() =>
    asked.value
      ? editor
          .property(asked.value.owner, asked.value.property)
          .values.find(value => value.id === asked.value!.statement)
      : undefined,
  )
  const options = computed(() => {
    const owner = asked.value?.owner
    const type = editor.members.value.find(member => member.id === owner)?.type
    return editor.members.value
      .filter(member => member.id !== owner && member.type === type)
      .map(member => ({ value: member.id, label: member.entry?.label || '未命名' }))
  })
  const open = computed({
    get: () => Boolean(item.value && options.value.length),
    set: next => {
      if (next) return
      const { move: _move, ...query } = route.query
      void router.replace({ query })
    },
  })

  watch(open, next => {
    if (next) target.value = null
  })

  function confirm() {
    if (!asked.value || !item.value || target.value === null) return
    editor.remove(asked.value.statement, 'WRONG_ENTRY')
    editor.add(target.value, asked.value.property, item.value.value)
    open.value = false
  }
</script>

<template>
  <Dialog v-model:open="open" title="移到另一个条目" size="sm">
    <template #content>
      <FormField label="移到">
        <Select v-model="target" :options="options" placeholder="选择条目" />
      </FormField>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button :disabled="target === null" @click="confirm">移动</Button>
    </template>
  </Dialog>
</template>

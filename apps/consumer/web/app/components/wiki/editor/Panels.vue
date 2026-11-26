<script setup lang="ts">
  import { Alert, Button, Text } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { ComputedRef } from 'vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import type { EditorPanel } from '~/features/wiki/editor/route'

  defineOptions({ name: 'WikiEditorPanels' })

  const props = defineProps<{
    entry: EditableEntry
    panel: EditorPanel | null
  }>()
  const emit = defineEmits<{ changed: [] }>()
  const nav = usePageNav()
  const { can } = useCreatorPermissions()
  const patrol = computed(() => can(WIKI_PERMISSIONS.PATROL))
  const deletable = computed(() => can(WIKI_PERMISSIONS.DELETE))
  const active = usePageActive()
  const editor = inject(ENTRY_EDITOR)!
  const marked = computed(() => props.entry.id in editor.draft.value.deleted)

  const opened = (panel: EditorPanel, allowed: ComputedRef<boolean>) =>
    computed({
      get: () => active.value && props.panel === panel && allowed.value,
      set: next => {
        if (!next) void nav.close(['panel'])
      },
    })
  const protecting = opened('protect', patrol)
  const restoring = opened('restore', deletable)
  const until = computed(() => props.entry.protection?.until?.slice(0, 10) ?? null)
</script>

<template>
  <Alert :open="Boolean(entry.protection)" tone="warning" title="条目已锁定">
    <Text size="sm"> {{ entry.protection?.reason }}{{ until ? `，到 ${until} 为止` : '' }} </Text>
  </Alert>
  <Alert :open="entry.deleted" tone="danger" title="条目已删除">
    <template v-if="deletable" #actions>
      <Button variant="soft" tone="danger" size="sm" @click="nav.query({ panel: 'restore' })">
        恢复条目
      </Button>
    </template>
  </Alert>
  <Alert :open="marked" tone="danger" title="保存后将删除此条目">
    <template #actions>
      <Button variant="soft" tone="danger" size="sm" @click="editor.erase(entry.id, false)">
        撤销删除
      </Button>
    </template>
  </Alert>
  <WikiEditorProtect v-model:open="protecting" :entry="entry" @done="emit('changed')" />
  <WikiEditorRestore v-model:open="restoring" :entry="entry" @done="emit('changed')" />
  <WikiEditorMove />
  <WikiEditorPicks :entry="entry" :panel="panel" />
  <WikiOrganizationPicks :entry="entry" :panel="panel" />
</template>

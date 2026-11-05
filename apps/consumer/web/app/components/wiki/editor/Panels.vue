<script setup lang="ts">
  import { Alert, Button, Text } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import type { EditorPanel } from '~/features/wiki/editor/route'

  defineOptions({ name: 'WikiEditorPanels' })

  const props = defineProps<{
    entry: EditableEntry
    panel: EditorPanel | null
    suggestion: number | null
    base: string
  }>()
  const emit = defineEmits<{ changed: [] }>()
  const route = useRoute()
  const { canAny } = useCreatorPermissions()
  const patrol = computed(() => canAny(WIKI_PERMISSIONS.PATROL))

  const opened = (panel: EditorPanel) =>
    computed({
      get: () => props.panel === panel && patrol.value,
      set: next => {
        if (!next) void navigateTo({ path: props.base, query: route.query })
      },
    })
  const protecting = opened('protect')
  const deleting = opened('delete')
  const dismissing = computed({
    get: () => props.panel === 'dismiss' && props.suggestion !== null,
    set: next => {
      if (!next) void navigateTo({ path: props.base, query: route.query })
    },
  })
  const until = computed(() => props.entry.protection?.until?.slice(0, 10) ?? null)
</script>

<template>
  <Alert :open="Boolean(entry.protection)" tone="warning" title="条目已锁定">
    <Text size="sm"> {{ entry.protection?.reason }}{{ until ? `，到 ${until} 为止` : '' }} </Text>
  </Alert>
  <Alert :open="entry.deleted" tone="danger" title="条目已删除">
    <Button v-if="patrol" variant="link" size="sm" @click="navigateTo(`${base}/delete`)">
      恢复条目
    </Button>
  </Alert>
  <WikiEditorProtect v-model:open="protecting" :entry="entry" @done="emit('changed')" />
  <WikiEditorDelete v-model:open="deleting" :entry="entry" @done="emit('changed')" />
  <WikiEditorDismiss v-model:open="dismissing" :entry="entry.id" :suggestion="suggestion" />
  <WikiEditorMove />
</template>

<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { BackendHistoryRow } from '~/features/creator/entry/contract'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'CreatorEntryHistoryActions' })
  const props = defineProps<{
    row: BackendHistoryRow
    latest: boolean
  }>()
  const emit = defineEmits<{ changed: [] }>()

  const { can } = useCreatorPermissions()
  const { confirm } = useHikariConfirm()
  const patrol = computed(() => can(WIKI_PERMISSIONS.PATROL))
  const open = computed(
    () => props.row.revision !== null && !props.row.reverted && !props.row.imported,
  )
  const single = computed(() => (props.row.edits.length === 1 ? props.row.edits[0] : null))

  function undo() {
    const edit = single.value
    if (!edit) return
    confirm({
      title: '撤销本次编辑？',
      description:
        '新的编辑会将值恢复为此次编辑之前的状态。若后续编辑改动了相同的值，请先撤销那些编辑。',
      confirmText: '撤销',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/wiki/edits/{id}/revert', {
          method: 'POST',
          path: { id: edit.id },
          body: {},
        })
        emit('changed')
      },
    })
  }

  function undoBatch() {
    const batch = props.row.batch_id
    if (batch === null) return
    confirm({
      title: '撤销整个批次？',
      description: '本批次中的每次编辑都将通过新的编辑撤销。',
      confirmText: '撤销批次',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/wiki/batches/{id}/revert', {
          method: 'POST',
          path: { id: batch },
          body: {},
        })
        emit('changed')
      },
    })
  }

  function rollback() {
    const entry = props.row.edits[0]?.entries[0]
    if (!entry) return
    confirm({
      title: `回退 ${displayName(props.row.editor)} 的编辑？`,
      description: '该成员对该条目连续做出的所有编辑，将从最新一次开始依次撤销。',
      confirmText: '回退',
      tone: 'danger',
      onConfirm: async () => {
        await hikariRequest('/api/v3/wiki/entries/{id}/rollback', {
          method: 'POST',
          path: { id: entry.id },
          body: { editor_id: props.row.editor.id },
        })
        emit('changed')
      },
    })
  }
</script>

<template>
  <Inline v-if="open" gap="xs" :wrap="false" @click.stop>
    <Button v-if="single" variant="ghost" tone="neutral" size="xs" @click="undo">撤销</Button>
    <Button
      v-else-if="patrol && row.batch_id !== null"
      variant="ghost"
      tone="neutral"
      size="xs"
      @click="undoBatch"
    >
      撤销批次
    </Button>
    <Button v-if="patrol && latest" variant="ghost" tone="neutral" size="xs" @click="rollback">
      回退
    </Button>
  </Inline>
</template>

<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'CreatorChangesActions' })
  const props = defineProps<{ row: ApiData<'/api/v3/wiki/changes', 'get'>['items'][number] }>()
  const emit = defineEmits<{ changed: [] }>()

  const { can } = useCreatorPermissions()
  const { confirm } = useHikariConfirm()
  const patrol = computed(() => can(WIKI_PERMISSIONS.PATROL))
  const open = computed(() => !props.row.reverted_at && !props.row.batch.imported)
  const patrolling = ref(false)

  async function mark() {
    patrolling.value = true
    try {
      await hikariRequest('/api/v3/wiki/edits/{id}/patrol', {
        method: 'POST',
        path: { id: props.row.id },
      })
      emit('changed')
    } finally {
      patrolling.value = false
    }
  }

  function ask(
    title: string,
    description: string,
    confirmText: string,
    run: () => Promise<unknown>,
  ) {
    confirm({
      title,
      description,
      confirmText,
      tone: 'danger',
      onConfirm: async () => {
        await run()
        emit('changed')
      },
    })
  }

  const undo = () =>
    ask(
      '撤销本次编辑？',
      '新的编辑会将值恢复为此次编辑之前的状态。若后续编辑改动了相同的值，请先撤销那些编辑。',
      '撤销',
      () =>
        hikariRequest('/api/v3/wiki/edits/{id}/revert', {
          method: 'POST',
          path: { id: props.row.id },
          body: {},
        }),
    )
  const undoBatch = () =>
    ask('撤销整个批次？', '本批次中的每次编辑都将通过新的编辑撤销。', '撤销批次', () =>
      hikariRequest('/api/v3/wiki/batches/{id}/revert', {
        method: 'POST',
        path: { id: props.row.batch.id },
        body: {},
      }),
    )
  const rollback = () => {
    const entry = props.row.entries[0]
    if (!entry) return
    ask(
      `回退 ${displayName(props.row.editor)} 的编辑？`,
      '该成员对该条目连续做出的所有编辑，将从最新一次开始依次撤销。',
      '回退',
      () =>
        hikariRequest('/api/v3/wiki/entries/{id}/rollback', {
          method: 'POST',
          path: { id: entry.id },
          body: { editor_id: props.row.editor.id },
        }),
    )
  }
</script>

<template>
  <Inline v-if="open" gap="xs" :wrap="false" @click.stop>
    <Button
      v-if="patrol && !row.patrolled_at"
      variant="ghost"
      tone="neutral"
      size="xs"
      :loading="patrolling"
      @click="mark"
    >
      标记为已巡查
    </Button>
    <Button variant="ghost" tone="neutral" size="xs" @click="undo">撤销</Button>
    <Button
      v-if="patrol && row.batch.task"
      variant="ghost"
      tone="neutral"
      size="xs"
      @click="undoBatch"
    >
      撤销批次
    </Button>
    <Button v-if="patrol" variant="ghost" tone="neutral" size="xs" @click="rollback">回退</Button>
  </Inline>
</template>

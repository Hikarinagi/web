<script setup lang="ts">
  import { Button, Inline } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { WIKI_PERMISSIONS } from '@hikarinagi/shared'

  defineOptions({ name: 'CreatorNoticesActions' })
  const props = defineProps<{ row: ApiData<'/api/v3/wiki/notices', 'get'>['items'][number] }>()
  const emit = defineEmits<{ changed: [] }>()

  const auth = useAuthStore()
  const { can } = useCreatorPermissions()
  const { confirm } = useHikariConfirm()
  const objecting = ref(false)
  const mine = computed(() => auth.user?.id === props.row.editor.id)

  const ask = (title: string, confirmText: string, run: () => Promise<unknown>) =>
    confirm({
      title,
      description: '该编辑将不会生效。',
      confirmText,
      tone: 'danger',
      onConfirm: async () => {
        await run()
        emit('changed')
      },
    })
  const decide = (apply: boolean) =>
    hikariRequest('/api/v3/wiki/edits/{id}/decision', {
      method: 'POST',
      path: { id: props.row.id },
      body: { apply },
    })
  const withdraw = () =>
    ask('撤回这次编辑？', '撤回', () =>
      hikariRequest('/api/v3/wiki/edits/{id}', { method: 'DELETE', path: { id: props.row.id } }),
    )
  async function apply() {
    await decide(true)
    emit('changed')
  }
</script>

<template>
  <Inline gap="xs" :wrap="false" @click.stop>
    <Button v-if="mine" variant="ghost" tone="neutral" size="xs" @click="withdraw">撤回</Button>
    <Button v-else variant="ghost" tone="neutral" size="xs" @click="objecting = true">反对</Button>
    <template v-if="can(WIKI_PERMISSIONS.PATROL)">
      <Button variant="ghost" tone="neutral" size="xs" @click="apply">提前执行</Button>
      <Button
        variant="ghost"
        tone="neutral"
        size="xs"
        @click="ask('驳回此次编辑？', '驳回', () => decide(false))"
      >
        驳回
      </Button>
    </template>
    <CreatorNoticesObject
      :id="row.id"
      v-model:open="objecting"
      :summary="row.summary"
      @saved="emit('changed')"
    />
  </Inline>
</template>

<script setup lang="ts">
  import { AlertDialog, Button, Card, Inline, Text } from '@hina-ui/vue'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiEditorSaveBar' })

  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const router = useRouter()
  const count = computed(() => editor.count.value)

  function panel(key: 'save' | 'discard', open: boolean) {
    const { [key]: _current, ...query } = route.query
    void router.replace({ query: open ? { ...query, [key]: '1' } : query })
  }
  const discarding = computed({
    get: () => route.query.discard === '1',
    set: open => panel('discard', open),
  })

  useEventListener('keydown', event => {
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
    event.preventDefault()
    if (count.value) panel('save', true)
  })
</script>

<template>
  <Card :padded="false" class="shrink-0">
    <Inline gap="md" align="center" justify="between" :wrap="false" class="px-4 py-3">
      <Text size="sm" :tone="count ? undefined : 'muted'">
        {{ count ? `已修改 ${count} 处` : '没有未保存的修改' }}
      </Text>
      <Inline gap="sm" :wrap="false">
        <Button
          variant="ghost"
          tone="neutral"
          size="sm"
          :disabled="!count"
          @click="panel('discard', true)"
        >
          放弃修改
        </Button>
        <Button size="sm" :disabled="!count" @click="panel('save', true)">保存</Button>
      </Inline>
    </Inline>
  </Card>
  <AlertDialog
    v-model:open="discarding"
    title="放弃修改"
    :description="`本标签页的 ${count} 处修改将被丢弃。`"
    tone="danger"
    confirm-text="放弃"
    cancel-text="继续编辑"
    @confirm="editor.discard()"
  />
</template>

<script setup lang="ts">
  import { AlertDialog, Button, Container, Inline, Text } from '@hina-ui/vue'
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
  const active = usePageActive()
  const discarding = computed({
    get: () => active.value && route.query.discard === '1',
    set: open => panel('discard', open),
  })

  useEventListener('keydown', event => {
    if (!active.value) return
    if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return
    event.preventDefault()
    if (count.value) panel('save', true)
  })
</script>

<template>
  <Inline
    v-if="count"
    as="footer"
    gap="none"
    class="z-10 shrink-0 border-t border-line bg-surface py-3"
  >
    <Container size="lg">
      <Inline gap="sm" align="center" justify="between" :wrap="false">
        <Text size="sm" weight="medium">已修改 {{ count }} 处</Text>
        <Inline gap="sm" align="center" :wrap="false">
          <Button variant="ghost" tone="neutral" @click="panel('discard', true)">放弃修改</Button>
          <Button @click="panel('save', true)">保存</Button>
        </Inline>
      </Inline>
    </Container>
  </Inline>
  <AlertDialog
    v-model:open="discarding"
    title="放弃修改？"
    :description="`此标签页共 ${count} 处修改，放弃后无法恢复。`"
    tone="danger"
    confirm-text="放弃修改"
    cancel-text="继续编辑"
    @confirm="editor.discard()"
  />
</template>

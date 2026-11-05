<script setup lang="ts">
  import { Button, Dialog, Text } from '@hina-ui/vue'

  defineOptions({ name: 'CreatorShellCloseConfirm' })

  const emit = defineEmits<{ close: [key: string] }>()
  const route = useRoute()
  const router = useRouter()
  const tabs = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()

  const tab = computed(() => tabs.tabs.find(item => item.key === route.query.close))
  const open = computed({
    get: () => Boolean(tab.value),
    set: next => {
      if (next) return
      const { close: _close, ...query } = route.query
      void router.replace({ query })
    },
  })

  function save() {
    const target = tab.value
    if (!target) return
    const [path, search = ''] = target.path.split('?')
    const query = new URLSearchParams(search)
    query.set('save', '1')
    void navigateTo(`${path}?${query.toString()}`)
  }

  function drop() {
    const target = tab.value
    if (!target) return
    open.value = false
    drafts.discard(target.key)
    emit('close', target.key)
  }
</script>

<template>
  <Dialog v-model:open="open" :title="`关闭「${tab?.title ?? ''}」`" size="sm">
    <template #content>
      <Text size="sm">这个标签页有 {{ tab ? drafts.count(tab.key) : 0 }} 处未保存的修改。</Text>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button variant="outline" tone="danger" @click="drop">不保存</Button>
      <Button @click="save">保存</Button>
    </template>
  </Dialog>
</template>

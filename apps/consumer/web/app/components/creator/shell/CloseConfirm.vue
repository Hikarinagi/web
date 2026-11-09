<script setup lang="ts">
  import { Button, Dialog, Text } from '@hina-ui/vue'
  import { resourceKey } from '~/features/creator/tabs'

  defineOptions({ name: 'CreatorShellCloseConfirm' })

  const emit = defineEmits<{ close: [id: string] }>()
  const router = useRouter()
  const tabs = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()

  const tab = computed(() => tabs.tabs.find(item => item.id === tabs.confirm))
  const key = computed(() => (tab.value ? resourceKey(tab.value.path) : ''))
  const open = computed({
    get: () => Boolean(tab.value),
    set: next => {
      if (!next) tabs.confirm = null
    },
  })

  async function save() {
    const target = tab.value
    tabs.confirm = null
    if (!target) return
    const to = router.resolve(target.path)
    await router.push({ path: to.path, query: { ...to.query, save: '1' }, hash: to.hash })
  }

  function drop() {
    const target = tab.value
    tabs.confirm = null
    if (!target) return
    drafts.discard(resourceKey(target.path))
    emit('close', target.id)
  }
</script>

<template>
  <Dialog v-model:open="open" :title="`关闭「${tab?.title ?? ''}」`" size="sm">
    <template #content>
      <Text size="sm">这个标签页有 {{ key ? drafts.count(key) : 0 }} 处未保存的修改。</Text>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" @click="open = false">取消</Button>
      <Button variant="outline" tone="danger" @click="drop">不保存</Button>
      <Button @click="save">保存</Button>
    </template>
  </Dialog>
</template>

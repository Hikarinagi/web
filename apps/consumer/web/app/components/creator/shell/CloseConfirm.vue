<script setup lang="ts">
  import { Button, Dialog, Text } from '@hina-ui/vue'
  import { resourceKey } from '~/features/creator/tabs'

  defineOptions({ name: 'CreatorShellCloseConfirm' })

  const emit = defineEmits<{ close: [id: string] }>()
  const route = useRoute()
  const router = useRouter()
  const tabs = useCreatorTabsStore()
  const drafts = useWikiDraftsStore()
  const nav = useTabNav()

  const tab = computed(() => tabs.tabs.find(item => item.id === route.query.close))
  const key = computed(() => (tab.value ? resourceKey(tab.value.path) : ''))
  const here = computed(() => {
    const { close: _close, ...query } = route.query
    return { path: route.path, query, hash: route.hash }
  })
  const open = computed({
    get: () => Boolean(tab.value),
    set: next => {
      if (!next) void nav.dismiss(here.value)
    },
  })

  async function save() {
    const target = tab.value
    if (!target) return
    await nav.dismiss(here.value)
    await nav.activate(target)
    await router.push({ query: { ...router.currentRoute.value.query, save: '1' } })
  }

  async function drop() {
    const target = tab.value
    if (!target) return
    drafts.discard(key.value)
    await nav.dismiss(here.value)
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

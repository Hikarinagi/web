<script setup lang="ts">
  import { Button, Dialog, Sheet, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'ArticleEditorDraftChooser' })

  const narrow = useNarrow()
  const mounted = useMounted()
  const asSheet = computed(() => mounted.value && narrow.value)
  const panel = computed(() => (asSheet.value ? Sheet : Dialog))
  const panelProps = computed(() => (asSheet.value ? { class: 'h-[60dvh]' } : { size: 'lg' }))

  const emit = defineEmits<{ restore: [id: number] }>()

  const { data, pending } = useHikariApiData('/api/v3/user/me/drafts', {
    query: { type: 'article', page: 1, page_size: 20 },
    lazy: true,
    server: false,
  })
  const drafts = computed(() => data.value?.items ?? [])

  const visible = ref(false)
  const selectedId = ref<number | null>(null)
  watch(
    pending,
    p => {
      if (!p && drafts.value.length > 0) {
        selectedId.value = drafts.value[0]?.id ?? null
        visible.value = true
      }
    },
    { immediate: true },
  )

  function confirm() {
    if (selectedId.value == null) return
    visible.value = false
    emit('restore', selectedId.value)
  }
</script>

<template>
  <component :is="panel" v-model:open="visible" title="从上次中断的地方继续" v-bind="panelProps">
    <template #content>
      <Stack gap="xs">
        <ArticleEditorDraftChooserItem
          v-for="draft in drafts"
          :key="draft.id"
          :draft="draft"
          :selected="draft.id === selectedId"
          @select="selectedId = draft.id"
        />
      </Stack>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" @click="visible = false">取消</Button>
      <Button :disabled="selectedId === null" @click="confirm">确定</Button>
    </template>
  </component>
</template>

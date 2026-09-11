<script setup lang="ts">
  import { Button, Dialog, Stack } from '@hina-ui/vue'

  defineOptions({ name: 'ArticleEditorDraftChooser' })

  const emit = defineEmits<{ restore: [id: number] }>()

  const { data, pending } = useHikariApiData('/api/v3/user/me/drafts', {
    query: { type: 'article', page: 1, page_size: 20 },
    lazy: true,
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
  <Dialog v-model:open="visible" title="从上次中断的地方继续" size="lg">
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
  </Dialog>
</template>

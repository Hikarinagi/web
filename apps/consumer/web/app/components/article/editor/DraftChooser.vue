<script setup lang="ts">
  import { breakpointsTailwind } from '@vueuse/core'

  defineOptions({ name: 'ArticleEditorDraftChooser' })

  const emit = defineEmits<{ restore: [id: number] }>()

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

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
  <Dialog
    v-if="!isMobile"
    v-model:visible="visible"
    modal
    header="从上次中断的地方继续"
    :draggable="false"
    :style="{ width: '34rem' }"
  >
    <ArticleEditorDraftChooserPanel
      :drafts="drafts"
      :selected-id="selectedId"
      @select="selectedId = $event"
      @confirm="confirm"
      @cancel="visible = false"
    />
  </Dialog>

  <Drawer
    v-else
    v-model:visible="visible"
    position="bottom"
    header="从上次中断的地方继续"
    :pt="{ root: { class: 'app-mobile-sheet h-auto! max-h-[82dvh]!' } }"
  >
    <ArticleEditorDraftChooserPanel
      :drafts="drafts"
      :selected-id="selectedId"
      @select="selectedId = $event"
      @confirm="confirm"
      @cancel="visible = false"
    />
  </Drawer>
</template>

<script setup lang="ts">
  import { Button, Dialog, Sheet } from '@hina-ui/vue'
  import type { ArticleEditorHost } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishDialog' })

  const narrow = useNarrow()
  const mounted = useMounted()
  const asSheet = computed(() => mounted.value && narrow.value)
  const panel = computed(() => (asSheet.value ? Sheet : Dialog))
  const panelProps = computed(() => (asSheet.value ? { class: 'h-[70dvh]' } : { size: 'md' }))

  const props = defineProps<{ host: ArticleEditorHost }>()
  const visible = defineModel<boolean>('visible', { default: false })

  const { publishing, canPublish, publish } = props.host

  function close() {
    if (!publishing.value) visible.value = false
  }
</script>

<template>
  <component
    :is="panel"
    v-model:open="visible"
    title="发布设置"
    :locked="publishing"
    v-bind="panelProps"
  >
    <template #content>
      <ArticleEditorPublishForm :host="host" />
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="publishing" @click="close">取消</Button>
      <Button :loading="publishing" :disabled="!canPublish" @click="publish">确认发布</Button>
    </template>
  </component>
</template>

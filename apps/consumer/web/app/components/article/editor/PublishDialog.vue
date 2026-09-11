<script setup lang="ts">
  import { Button, Dialog } from '@hina-ui/vue'
  import type { ArticleEditorHost } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishDialog' })

  const props = defineProps<{ host: ArticleEditorHost }>()
  const visible = defineModel<boolean>('visible', { default: false })

  const { publishing, canPublish, publish } = props.host

  function close() {
    if (!publishing.value) visible.value = false
  }
</script>

<template>
  <Dialog v-model:open="visible" title="发布设置" size="md" :locked="publishing">
    <template #content>
      <ArticleEditorPublishForm :host="host" />
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="publishing" @click="close">取消</Button>
      <Button :loading="publishing" :disabled="!canPublish" @click="publish">确认发布</Button>
    </template>
  </Dialog>
</template>

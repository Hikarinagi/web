<script setup lang="ts">
  import { breakpointsTailwind } from '@vueuse/core'
  import type { ArticleEditorHost } from './composables/useArticleEditor'

  defineOptions({ name: 'ArticleEditorPublishDialog' })

  const props = defineProps<{ host: ArticleEditorHost }>()
  const visible = defineModel<boolean>('visible', { default: false })

  const { publishing } = props.host
  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

  function close() {
    if (!publishing.value) visible.value = false
  }
</script>

<template>
  <Dialog
    v-if="!isMobile"
    v-model:visible="visible"
    modal
    header="发布设置"
    :draggable="false"
    :dismissable-mask="!publishing"
    :close-on-escape="!publishing"
    :style="{ width: '460px' }"
  >
    <ArticleEditorPublishForm :host="host" @cancel="close" />
  </Dialog>

  <Drawer
    v-else
    v-model:visible="visible"
    position="bottom"
    header="发布设置"
    :dismissable-mask="!publishing"
    :close-on-escape="!publishing"
    :pt="{ root: { class: 'app-mobile-sheet h-auto! max-h-[88dvh]!' } }"
  >
    <ArticleEditorPublishForm :host="host" @cancel="close" />
  </Drawer>
</template>

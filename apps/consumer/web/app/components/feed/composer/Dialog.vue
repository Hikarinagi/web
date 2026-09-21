<script setup lang="ts">
  import { Dialog } from '@hina-ui/vue'
  import { usePostComposerDialog } from './composables/usePostComposerDialog'

  defineOptions({ name: 'FeedComposerDialog' })

  const { open, submitting, close } = usePostComposerDialog()

  function onOpenChange(value: boolean | undefined) {
    if (!value) close()
  }
</script>

<template>
  <Dialog
    :open="open"
    title="发布图文"
    placement="top"
    size="xl"
    :header="false"
    :locked="submitting"
    @update:open="onOpenChange"
  >
    <template #body>
      <FeedComposerDialogPanel />
    </template>
  </Dialog>
</template>

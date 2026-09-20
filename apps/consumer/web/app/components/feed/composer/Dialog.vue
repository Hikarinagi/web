<script setup lang="ts">
  import { usePostComposerDialog } from './composables/usePostComposerDialog'

  defineOptions({ name: 'FeedComposerDialog' })

  const { open, submitting, close } = usePostComposerDialog()
</script>

<template>
  <Dialog
    :visible="open"
    modal
    position="top"
    :draggable="false"
    :show-header="false"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    class="mt-[8vh] w-[600px] max-w-[calc(100vw-2rem)]"
    :pt="{ content: { class: 'p-0! overflow-hidden rounded-[inherit]' } }"
    @update:visible="v => !v && close()"
  >
    <FeedComposerDialogPanel />
  </Dialog>
</template>

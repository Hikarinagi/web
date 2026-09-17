<script setup lang="ts">
  import { AlertDialog } from '@hina-ui/vue'

  defineOptions({ name: 'UiConfirmHost' })

  const { open, options } = useHikariConfirm()
  let confirmed = false

  function onConfirm() {
    confirmed = true
    return options.value?.onConfirm()
  }

  watch(open, value => {
    if (value) {
      confirmed = false
      return
    }
    if (!confirmed) options.value?.onCancel?.()
  })
</script>

<template>
  <AlertDialog
    v-model:open="open"
    :title="options?.title ?? ''"
    :description="options?.description"
    :confirm-text="options?.confirmText"
    :cancel-text="options?.cancelText"
    :tone="options?.tone"
    :confirm-delay="options?.confirmDelay"
    :on-confirm="onConfirm"
    @error="() => {}"
  />
</template>

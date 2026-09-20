<script setup lang="ts">
  import type { ConfirmationOptions } from 'primevue/confirmationoptions'

  defineOptions({ name: 'UiConfirmDialogBody' })

  const props = defineProps<{
    message: ConfirmationOptions
    closeCallback: () => void
  }>()

  const countdownSeconds = computed(() => {
    const countdown = props.message.countdown
    if (countdown === false) return 0
    return countdown ?? 0
  })

  const { remaining, start, stop } = useCountdown(0, { immediate: false })

  const loading = computed(() => Boolean(props.message.loading?.()))
  const countdownPending = computed(
    () => !loading.value && countdownSeconds.value > 0 && remaining.value > 0,
  )
  const acceptLabel = computed(() => {
    const label = props.message.acceptLabel ?? '确认'
    if (countdownPending.value) return `${label} (${remaining.value}s)`
    return label
  })

  watch(
    [() => props.message, countdownSeconds],
    () => {
      if (countdownSeconds.value > 0) {
        start(countdownSeconds.value)
        return
      }
      stop()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stop()
  })

  function accept() {
    if (loading.value || countdownPending.value) return
    if (props.message.onAccept) {
      void props.message.onAccept({ close: props.closeCallback })
      return
    }

    props.message.accept?.()
    props.closeCallback()
  }

  function reject() {
    if (loading.value) return
    props.message.reject?.()
    props.closeCallback()
  }
</script>

<template>
  <section
    role="alertdialog"
    aria-modal="true"
    class="w-[min(92vw,26rem)] rounded-lg bg-surface-0 p-6 text-color shadow-xl ring-1 ring-surface-200 dark:bg-surface-950 dark:ring-surface-800"
  >
    <header class="space-y-2">
      <h2 class="text-lg font-semibold">{{ message.header }}</h2>
      <p class="text-sm leading-6 text-muted-color">{{ message.message }}</p>
    </header>

    <footer class="mt-6 flex justify-end gap-2">
      <Button
        :label="message.rejectLabel ?? '取消'"
        severity="secondary"
        variant="text"
        :disabled="loading"
        @click="reject"
      />
      <Button
        :label="acceptLabel"
        severity="danger"
        :loading="loading"
        :disabled="countdownPending"
        @click="accept"
      />
    </footer>
  </section>
</template>

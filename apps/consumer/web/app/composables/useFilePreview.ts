import type { Ref } from 'vue'

type SetFieldFn = (value: File | null) => void

export function useFilePreview(inputRef: Ref<HTMLInputElement | null>) {
  const previewUrl = ref<string | null>(null)

  function revoke() {
    if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
    previewUrl.value = null
  }

  function open() {
    inputRef.value?.click()
  }

  function onChange(setField: SetFieldFn, event: Event) {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0] ?? null
    revoke()
    if (file) previewUrl.value = URL.createObjectURL(file)
    setField(file)
    target.value = ''
  }

  function onClear(setField: SetFieldFn) {
    revoke()
    setField(null)
  }

  onBeforeUnmount(revoke)

  return { previewUrl, revoke, open, onChange, onClear }
}

import { ref, shallowRef } from 'vue'

export interface HikariConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  tone?: 'accent' | 'danger'
  confirmDelay?: number
  onConfirm: () => unknown
  onCancel?: () => void
}

const open = ref(false)
const options = shallowRef<HikariConfirmOptions | null>(null)

export function useHikariConfirm() {
  function confirm(next: HikariConfirmOptions) {
    options.value = next
    open.value = true
  }

  return { confirm, open, options }
}

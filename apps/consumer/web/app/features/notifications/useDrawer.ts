import type { SystemMessageItem } from './notifications'

const item = ref<SystemMessageItem | null>(null)
const visible = ref(false)

export function useNotificationDrawer() {
  function open(next: SystemMessageItem) {
    item.value = next
    visible.value = true
  }
  function close() {
    visible.value = false
  }
  return { visible, item, open, close }
}

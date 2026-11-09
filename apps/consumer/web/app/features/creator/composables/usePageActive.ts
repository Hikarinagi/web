export function usePageActive() {
  const active = ref(true)
  onActivated(() => {
    active.value = true
  })
  onDeactivated(() => {
    active.value = false
  })
  onBeforeUnmount(() => {
    active.value = false
  })
  return readonly(active)
}

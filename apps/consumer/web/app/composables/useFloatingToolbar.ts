import type { Component, MaybeRefOrGetter } from 'vue'

export type FloatingToolbarTopHandler = () => void | Promise<void>

export interface FloatingToolbarTopOptions {
  icon?: MaybeRefOrGetter<Component>
  label?: MaybeRefOrGetter<string>
}

interface TopEntry extends FloatingToolbarTopOptions {
  handler: FloatingToolbarTopHandler
}

export interface FloatingToolbarAction {
  id: string
  label: string
  icon: Component
  order?: number
  visible?: MaybeRefOrGetter<boolean>
  disabled?: MaybeRefOrGetter<boolean>
  buttonClass?: MaybeRefOrGetter<string>
  iconClass?: MaybeRefOrGetter<string>
  onClick: () => void | Promise<void>
}

const actions = shallowReactive(new Map<string, FloatingToolbarAction>())
const topCallbacks = shallowReactive(new Map<string, TopEntry>())

export function useFloatingToolbar() {
  const items = computed(() =>
    [...actions.values()].sort((a, b) => (a.order ?? 100) - (b.order ?? 100)),
  )
  const topHandlers = computed(() => [...topCallbacks.values()].map(entry => entry.handler))
  const activeTop = computed(() => {
    const entry = [...topCallbacks.values()].at(-1)
    if (!entry) return null
    return { handler: entry.handler, icon: toValue(entry.icon), label: toValue(entry.label) }
  })

  function set(action: FloatingToolbarAction) {
    if (!import.meta.client) return

    actions.set(action.id, action)
  }

  function remove(id: string) {
    if (!import.meta.client) return

    actions.delete(id)
  }

  function setTopHandler(
    id: string,
    handler: FloatingToolbarTopHandler,
    options?: FloatingToolbarTopOptions,
  ) {
    if (!import.meta.client) return

    topCallbacks.set(id, { handler, icon: options?.icon, label: options?.label })
  }

  function removeTopHandler(id: string) {
    if (!import.meta.client) return

    topCallbacks.delete(id)
  }

  function add(action: FloatingToolbarAction) {
    const register = () => set(action)
    const unregister = () => remove(action.id)

    onMounted(register)
    onActivated(register)
    onDeactivated(unregister)
    onBeforeUnmount(unregister)
  }

  function addTopHandler(
    id: string,
    handler: FloatingToolbarTopHandler,
    options?: FloatingToolbarTopOptions,
  ) {
    const register = () => setTopHandler(id, handler, options)
    const unregister = () => removeTopHandler(id)

    onMounted(register)
    onActivated(register)
    onDeactivated(unregister)
    onBeforeUnmount(unregister)
  }

  return {
    actions: items,
    topHandlers,
    activeTop,
    add,
    addTopHandler,
    remove,
    removeTopHandler,
    set,
    setTopHandler,
  }
}

import type { components } from '@hikarinagi/api-contract/v3'

type OnlineUser = components['schemas']['UserRefDto']

export function useProjectRoom<T extends { project_id: number }>(
  kind: 'novel' | 'manga',
  projectId: MaybeRefOrGetter<number>,
  onChange: (change: T) => void,
) {
  const { on, emit, connected } = useRealtime()
  const online = ref<OnlineUser[]>([])
  const positions = reactive(new Map<number, string | null>())
  let current: string | null = null

  const offs = [
    on<{ project_id: number; users: OnlineUser[] }>('workbench:presence', payload => {
      if (payload.project_id !== toValue(projectId)) return
      const joined = payload.users.some(user => !online.value.some(item => item.id === user.id))
      online.value = payload.users
      if (joined && current) focus(current)
    }),
    on<T>(kind === 'novel' ? 'workbench:segment' : 'workbench:region', payload => {
      if (payload.project_id === toValue(projectId)) onChange(payload)
    }),
    on<{ kind: string; project_id: number; user_id: number; target: string | null }>(
      'workbench:focus',
      payload => {
        if (payload.kind !== kind || payload.project_id !== toValue(projectId)) return
        positions.set(payload.user_id, payload.target)
      },
    ),
  ]

  const editing = computed(() => {
    const targets = new Map<string, OnlineUser[]>()
    for (const user of online.value) {
      const target = positions.get(user.id)
      if (target) targets.set(target, [...(targets.get(target) ?? []), user])
    }
    return targets
  })

  function focus(target: string | null) {
    current = target
    if (connected.value) emit(`workbench:${kind}:focus`, { project_id: toValue(projectId), target })
  }

  watch(
    [() => toValue(projectId), connected],
    ([id, live], previous) => {
      const previousId = previous?.[0]
      if (previousId && previousId !== id) emit(`workbench:${kind}:leave`, previousId)
      if (!live) return
      emit(`workbench:${kind}:enter`, id)
      if (current) focus(current)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    offs.forEach(off => off())
    emit(`workbench:${kind}:leave`, toValue(projectId))
  })

  return { online, editing, focus }
}

import type { SearchResult } from '@ritojs/kit'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderJumps } from './useReaderJumps'
import type { ReaderLocation } from './useReaderLocation'
import type { ReaderShell } from './useReaderShell'

export function useReaderSearch(options: {
  engine: ReaderEngine
  location: ReaderLocation
  jumps: ReaderJumps
  shell: ReaderShell
}) {
  const { engine, location, jumps, shell } = options
  const query = ref('')
  const term = refDebounced(
    computed(() => query.value.trim()),
    300,
  )
  const results = shallowRef<readonly SearchResult[]>([])
  const active = ref(-1)
  const visited = ref(false)
  const answered = ref('')
  const summons = ref(0)
  let asked = ''
  let before: string | null = null

  function reset() {
    asked = ''
    results.value = []
    active.value = -1
    visited.value = false
    answered.value = ''
  }

  watch(
    engine.stack,
    (stack, _, onCleanup) => {
      reset()
      if (!stack) return
      const offs = [
        stack.controller.on('searchResults', ({ results: found, activeIndex }) => {
          results.value = found
          active.value = activeIndex
          visited.value = false
          answered.value = asked
        }),
        stack.controller.on('searchActiveChange', ({ activeIndex }) => {
          active.value = activeIndex
        }),
        stack.controller.on('searchOpen', open),
      ]
      onCleanup(() => offs.forEach(off => off()))
    },
    { immediate: true },
  )

  watch([term, location.laid, engine.stack], ([value, laid, stack]) => {
    const controller = stack?.controller
    if (!controller) return
    if (!value) {
      if (asked) controller.clearSearch()
      reset()
      return
    }
    if (!laid || value === asked) return
    asked = value
    controller.search(value)
  })

  watch(term, value => {
    if (!value || shell.phone.value || !shell.medium.value) return
    if (shell.tab.value !== 'search') {
      before = shell.tab.value
      shell.tab.value = 'search'
    }
    if (!shell.stored.value.left) shell.toggleLeft()
  })

  const status = computed(() => {
    if (!term.value) return 'idle'
    if (!location.laid.value) return 'preparing'
    if (answered.value !== term.value) return 'searching'
    return results.value.length ? 'found' : 'empty'
  })

  const current = computed(() => (visited.value ? active.value : -1))

  const pinned = computed(
    () => shell.phone.value && status.value === 'found' && current.value >= 0 && !shell.sheet.value,
  )

  function go(index: number) {
    const stack = engine.stack.value
    const result = results.value[index]
    if (!stack || !result) return
    const spread = stack.reader.findSpread(result.pageIndex)
    if (spread !== location.position.value?.projection.spreadIndex) jumps.remember()
    visited.value = true
    stack.controller.goToSearchResult(index)
  }

  function step(forward: boolean) {
    const total = results.value.length
    if (!total) return
    if (visited.value) {
      go((active.value + (forward ? 1 : total - 1)) % total)
      return
    }
    const stack = engine.stack.value
    const spread = location.position.value?.projection.spreadIndex
    const page = spread == null ? undefined : stack?.controller.spreads[spread]?.pageIndexes[0]
    if (page == null) {
      go(forward ? 0 : total - 1)
      return
    }
    const found = forward
      ? results.value.findIndex(result => result.pageIndex >= page)
      : results.value.findLastIndex(result => result.pageIndex <= page)
    go(found < 0 ? (forward ? 0 : total - 1) : found)
  }

  function open() {
    summons.value += 1
  }

  function close() {
    query.value = ''
    if (asked) engine.stack.value?.controller.clearSearch()
    reset()
    if (before && shell.tab.value === 'search') shell.tab.value = before
    before = null
  }

  return { query, term, results, current, status, pinned, summons, go, step, open, close }
}

export type ReaderSearch = ReturnType<typeof useReaderSearch>

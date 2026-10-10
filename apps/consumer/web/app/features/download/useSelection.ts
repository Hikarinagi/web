import { computed, ref, watch, type Ref } from 'vue'

export function useSelection(
  items: () => { id: number; label: string }[],
  selected: Ref<number[]>,
) {
  const start = ref<string | number | null>(null)
  const end = ref<string | number | null>(null)
  const keyword = ref('')
  const options = computed(() => items().map(item => ({ value: item.id, label: item.label })))
  const from = computed(() => items().findIndex(item => item.id === start.value))
  const to = computed(() => items().findIndex(item => item.id === end.value))
  const endOptions = computed(() => options.value.slice(Math.max(0, from.value)))
  const visible = computed(() => {
    const query = keyword.value.trim().toLocaleLowerCase()
    return items().filter(item => item.label.toLocaleLowerCase().includes(query))
  })
  watch(
    items,
    value => {
      start.value = value[0]?.id ?? null
      end.value = value.at(-1)?.id ?? null
    },
    { immediate: true },
  )

  function applyRange() {
    if (from.value < 0 || to.value < from.value) return
    selected.value = items()
      .slice(from.value, to.value + 1)
      .map(item => item.id)
  }

  function setStart(value: string | number | null | undefined) {
    if (value == null) return
    start.value = value
    if (to.value < from.value) end.value = value
    applyRange()
  }

  function setEnd(value: string | number | null | undefined) {
    if (value == null) return
    end.value = value
    applyRange()
  }

  function toggle(id: number, checked: boolean | 'indeterminate') {
    selected.value =
      checked === true
        ? [...new Set([...selected.value, id])]
        : selected.value.filter(value => value !== id)
  }

  function selectAll() {
    selected.value = items().map(item => item.id)
  }

  function clear() {
    selected.value = []
  }

  return {
    start,
    end,
    keyword,
    options,
    endOptions,
    visible,
    setStart,
    setEnd,
    toggle,
    selectAll,
    clear,
  }
}

import { computed, ref, watch, type Ref } from 'vue'

export function useSelection(
  items: () => { id: number; label: string }[],
  selected: Ref<number[]>,
) {
  const mode = ref<string | number>('all')
  const start = ref<string | number | null>(null)
  const end = ref<string | number | null>(null)
  const keyword = ref('')
  const custom = ref<number[]>([])
  const options = computed(() => items().map(item => ({ value: item.id, label: item.label })))
  const from = computed(() => items().findIndex(item => item.id === start.value))
  const to = computed(() => items().findIndex(item => item.id === end.value))
  const endOptions = computed(() => options.value.slice(Math.max(0, from.value)))
  const range = computed(() =>
    from.value >= 0 && to.value >= from.value
      ? items()
          .slice(from.value, to.value + 1)
          .map(item => item.id)
      : [],
  )
  const visible = computed(() => {
    const query = keyword.value.trim().toLocaleLowerCase()
    return items().filter(item => item.label.toLocaleLowerCase().includes(query))
  })
  watch(
    items,
    value => {
      mode.value = selected.value.length === value.length ? 'all' : 'custom'
      custom.value = [...selected.value]
      start.value = value[0]?.id ?? null
      end.value = value.at(-1)?.id ?? null
    },
    { immediate: true },
  )
  watch(start, () => {
    if (from.value >= 0 && to.value < from.value) end.value = start.value
  })
  watch(range, value => {
    if (mode.value === 'range') selected.value = value
  })

  function changeMode(value: string | number | undefined) {
    if (value === undefined) return
    if (mode.value === 'custom') custom.value = [...selected.value]
    mode.value = value
    selected.value =
      value === 'all'
        ? items().map(item => item.id)
        : value === 'range'
          ? range.value
          : [...custom.value]
  }

  function toggle(id: number, checked: boolean | 'indeterminate') {
    selected.value =
      checked === true
        ? [...new Set([...selected.value, id])]
        : selected.value.filter(value => value !== id)
  }

  return { mode, start, end, keyword, options, endOptions, visible, changeMode, toggle }
}

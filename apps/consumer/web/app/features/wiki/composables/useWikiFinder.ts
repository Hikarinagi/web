export function useWikiFinder() {
  const open = useState('wiki-finder-open', () => false)
  return {
    open,
    show() {
      open.value = true
    },
  }
}

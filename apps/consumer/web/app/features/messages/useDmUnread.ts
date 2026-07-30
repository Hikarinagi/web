export function useDmUnread() {
  const count = useState('dm:unread', () => 0)

  function set(next: number) {
    count.value = next
  }

  return { count: readonly(count), set }
}

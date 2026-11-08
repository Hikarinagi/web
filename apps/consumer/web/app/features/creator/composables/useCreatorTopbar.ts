export function useCreatorTopbar() {
  const subtitle = useState<string | null>('creator-topbar:subtitle', () => null)
  return { subtitle }
}

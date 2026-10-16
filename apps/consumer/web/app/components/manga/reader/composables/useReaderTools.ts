import { toast } from '@hina-ui/vue'

export function useReaderTools(mangaId: () => number) {
  const settingsOpen = ref(false)
  const settingsAnchor = ref<HTMLElement | null>(null)

  function openSettings(event: Event) {
    settingsAnchor.value = event.currentTarget instanceof HTMLElement ? event.currentTarget : null
    settingsOpen.value = !settingsOpen.value
  }

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen()
  const { copy } = useClipboard()

  async function copyLink() {
    await copy(new URL(`/mangas/${mangaId()}`, window.location.origin).href)
    toast.success('已复制作品链接')
  }

  return { settingsOpen, settingsAnchor, openSettings, isFullscreen, toggleFullscreen, copyLink }
}

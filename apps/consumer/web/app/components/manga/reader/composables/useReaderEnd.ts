import { toast } from '@hina-ui/vue'
import { mangaChapterLabel } from '@hikarinagi/shared'
import type { MangaReadPageData } from '~~/server/api/pages/mangas/reader/[id]/[chapterId].get'
import { useMangaRate } from '~/features/manga/useMangaRate'
import type { useReaderItems } from './useReaderItems'

export function useReaderEnd(
  data: () => MangaReadPageData,
  items: ReturnType<typeof useReaderItems>,
) {
  const auth = useAuthStore()
  const manga = computed(() => data().manifest.manga)
  const rate = useMangaRate(manga.value.id, data().my_rate)

  async function mark() {
    try {
      await rate.setStatus('GOING', false)
      toast.success('已标记在看')
    } catch {
      return
    }
  }

  const props = computed(() => {
    const manifest = data().manifest
    return {
      mangaId: manga.value.id,
      mangaTitle: manga.value.name_cn || manga.value.name,
      unit: items.unit.value,
      noun: items.noun.value,
      label: items.label.value,
      nextLabel: manifest.next_chapter ? mangaChapterLabel(manifest.next_chapter) : null,
      nextLocked: manifest.next_chapter_locked,
      hasPrevious: !!manifest.prev_chapter,
      serializing: items.serializing.value,
      continueChapters: items.continueChapters.value,
      showMarkCta: auth.isAuthenticated && !rate.status.value,
      marking: rate.pending.value,
    }
  })

  const events = {
    next: () => items.openSibling('next'),
    previous: () => items.openSibling('previous'),
    continueChapters: items.openChapters,
    mark,
  }

  return { props, events }
}

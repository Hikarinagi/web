import { stripNovelMarkup } from '@hikarinagi/shared'
import type { BackendNovelImportPreview } from '~/features/workbench/workbench'

export function useImportOutline(preview: BackendNovelImportPreview) {
  const initial = () => preview.chapters.map(chapter => ({ ...chapter }))
  const chapters = ref(initial())
  const current = ref(
    Math.max(
      0,
      preview.chapters.findIndex(chapter => chapter.included),
    ),
  )

  const stats = computed(() =>
    chapters.value.map(chapter => {
      let texts = 0
      let images = 0
      for (let index = chapter.from; index < chapter.to; index += 1) {
        const kind = preview.blocks[index]?.kind
        if (kind === 'TEXT') texts += 1
        else if (kind === 'IMAGE') images += 1
      }
      return { texts, images }
    }),
  )
  const total = computed(() =>
    chapters.value.reduce(
      (sum, chapter, index) =>
        chapter.included
          ? {
              chapters: sum.chapters + 1,
              texts: sum.texts + (stats.value[index]?.texts ?? 0),
              images: sum.images + (stats.value[index]?.images ?? 0),
            }
          : sum,
      { chapters: 0, texts: 0, images: 0 },
    ),
  )
  const payload = computed(() =>
    chapters.value
      .filter(chapter => chapter.included)
      .map(({ title, from, to }) => ({ title, from, to })),
  )

  function canSplit(block: number, asTitle: boolean) {
    const chapter = chapters.value.find(item => block >= item.from && block < item.to)
    if (!chapter) return false
    if (asTitle) return preview.blocks[block]?.kind === 'TEXT' && block + 1 < chapter.to
    return block > chapter.from
  }

  function split(block: number, asTitle: boolean) {
    if (!canSplit(block, asTitle)) return
    const index = chapters.value.findIndex(item => block >= item.from && block < item.to)
    const chapter = chapters.value[index]
    if (!chapter) return
    const title = asTitle
      ? stripNovelMarkup(preview.blocks[block]?.text ?? '').slice(0, 200)
      : `${chapter.title}（续）`.slice(0, 200)
    const from = asTitle ? block + 1 : block
    if (block === chapter.from) {
      chapter.title = title
      chapter.from = from
      return
    }
    chapters.value.splice(index + 1, 0, { title, from, to: chapter.to, included: chapter.included })
    chapter.to = block
    current.value = index + 1
  }

  function mergeUp(index: number) {
    const previous = chapters.value[index - 1]
    const chapter = chapters.value[index]
    if (!previous || !chapter) return
    previous.to = chapter.to
    previous.included ||= chapter.included
    chapters.value.splice(index, 1)
    current.value = index - 1
  }

  function toggle(index: number | null, included: boolean) {
    for (const [at, chapter] of chapters.value.entries()) {
      if (index === null || index === at) chapter.included = included
    }
  }

  function rename(index: number, title: string) {
    const chapter = chapters.value[index]
    if (chapter && title.trim()) chapter.title = title.trim()
  }

  function reset() {
    chapters.value = initial()
    current.value = Math.max(
      0,
      preview.chapters.findIndex(chapter => chapter.included),
    )
  }

  return {
    chapters,
    current,
    stats,
    total,
    payload,
    canSplit,
    split,
    mergeUp,
    toggle,
    rename,
    reset,
  }
}

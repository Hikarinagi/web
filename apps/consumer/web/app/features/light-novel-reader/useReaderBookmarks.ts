import type { ApiData } from '@hikarinagi/api-contract/v3'
import type { ReaderLocator, ReaderSemanticNode, ReaderSourcePosition } from '@ritojs/core'
import { locatorOf } from './engine'
import { positionOf } from './payload'
import { spineIndexOf } from './toc'
import type { ReaderEngine } from './useReaderEngine'
import type { ReaderLocation } from './useReaderLocation'

export type ReaderBookmark = ApiData<'/api/v3/reader/volumes/{volume_id}/bookmarks', 'get'>[number]

export interface BookmarkEntry {
  id: string
  serverId: number | null
  locator: ReaderLocator | null
  chapter: string
  text: string
  note: string
  progress: number
  createdAt: number
}

function entryOf(item: ReaderBookmark): BookmarkEntry {
  return shallowReactive({
    id: item.client_id,
    serverId: item.id,
    locator: locatorOf(item.position) ?? null,
    chapter: item.chapter_title ?? '',
    text: item.text ?? '',
    note: item.note ?? '',
    progress: item.position.progress,
    createdAt: Date.parse(item.created_at),
  })
}

const sourceOf = (locator: ReaderLocator | null): ReaderSourcePosition | null =>
  locator?.sourcePoint ? { href: locator.href, point: locator.sourcePoint } : null

const textOf = (nodes: readonly ReaderSemanticNode[]): string =>
  nodes.map(node => node.text ?? textOf(node.children)).join('')

export function useReaderBookmarks(options: {
  volumeId: () => number
  engine: ReaderEngine
  location: ReaderLocation
}) {
  const entries = ref<BookmarkEntry[]>([])
  const here = ref<string[]>([])
  let check = 0

  function reset(list: readonly ReaderBookmark[]) {
    entries.value = list.map(entryOf)
    here.value = []
  }

  async function bounds() {
    const stack = options.engine.stack.value
    const position = options.location.position.value
    const anchorOf = stack?.reader.interactions?.getPageReadingAnchor
    if (!stack || !position || !anchorOf) return null
    const pages = stack.controller.spreads[position.projection.spreadIndex]?.pageIndexes ?? [
      position.projection.pageIndex,
    ]
    const [start, end] = await Promise.all([
      anchorOf.call(stack.reader.interactions, pages[0]!),
      anchorOf.call(stack.reader.interactions, pages.at(-1)! + 1),
    ])
    return {
      stack,
      position,
      page: pages[0]!,
      start: start?.status === 'resolved' ? start.locator : null,
      end: end?.status === 'resolved' ? end.locator : null,
    }
  }

  async function refresh() {
    const id = ++check
    const range = await bounds()
    const interactions = range?.stack.reader.interactions
    const from = sourceOf(range?.start ?? null)
    const marked: string[] = []
    if (range && from && interactions?.compareSourcePositions) {
      const to = sourceOf(range.end)
      for (const entry of entries.value) {
        const at = sourceOf(entry.locator)
        if (!at || (await interactions.compareSourcePositions(at, from)) === -1) continue
        if (to && (await interactions.compareSourcePositions(at, to)) !== -1) continue
        marked.push(entry.id)
      }
    }
    if (id === check) here.value = marked
  }

  watch([options.location.position, () => entries.value.length], () => void refresh())

  async function add() {
    const range = await bounds()
    const locator = range?.start
    if (!range || !locator) return
    const { stack, position } = range
    const point = locator.sourcePoint
    const id = `ln-${locator.href}-${point ? `${point.nodePath.join('.')}:${point.textOffset}` : `p${(locator.progression ?? 0).toFixed(4)}`}`
    const semantics = await stack.reader.interactions?.getPageSemantics?.(range.page)
    const text = textOf(semantics?.nodes ?? [])
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 60)
    const chapter = options.location.title.value || options.location.current.value?.label || ''
    const spineIdref = [...stack.reader.manifestHrefMap].find(
      ([, href]) => href === locator.href,
    )?.[0]
    const entry: BookmarkEntry = shallowReactive({
      id,
      serverId: null,
      locator,
      chapter,
      text,
      note: '',
      progress: position.progress,
      createdAt: Date.now(),
    })
    entries.value = [...entries.value, entry]
    here.value = [id]
    try {
      const saved = await hikariRequest('/api/v3/reader/volumes/{volume_id}/bookmarks', {
        method: 'post',
        path: { volume_id: options.volumeId() },
        body: {
          client_id: id,
          position: {
            ...positionOf({ ...position, sourceLocator: locator }),
            ...(spineIdref && {
              locator: {
                spineIdref,
                manifestHref: locator.href,
                chapterProgress: locator.progression ?? 0,
                ...(point && {
                  sourcePoint: { nodePath: [...point.nodePath], textOffset: point.textOffset },
                }),
              },
            }),
          },
          chapter_href: locator.href,
          chapter_index: spineIndexOf(stack.reader, locator.href),
          ...(chapter && { chapter_title: chapter }),
          ...(text && { text }),
        },
      })
      entry.serverId = saved.id
    } catch {
      entries.value = entries.value.filter(item => item !== entry)
      void refresh()
    }
  }

  async function remove(entry: BookmarkEntry) {
    entries.value = entries.value.filter(item => item !== entry)
    here.value = here.value.filter(id => id !== entry.id)
    if (entry.serverId == null) return
    try {
      await hikariRequest('/api/v3/reader/bookmarks/{id}', {
        method: 'delete',
        path: { id: entry.serverId },
      })
    } catch {
      entries.value = [...entries.value, entry]
      void refresh()
    }
  }

  function toggle() {
    const marked = entries.value.filter(entry => here.value.includes(entry.id))
    if (!marked.length) return add()
    return Promise.all(marked.map(remove))
  }

  async function annotate(entry: BookmarkEntry, note: string) {
    if (entry.note === note) return
    if (entry.serverId == null) throw new Error('书签尚未保存，请稍后再试')
    await hikariRequest('/api/v3/reader/bookmarks/{id}', {
      method: 'patch',
      path: { id: entry.serverId },
      body: { note: note || null },
      toast: false,
    })
    entry.note = note
  }

  const marked = computed(() => here.value.length > 0)

  return { entries, marked, reset, toggle, remove, annotate }
}

export type ReaderBookmarks = ReturnType<typeof useReaderBookmarks>

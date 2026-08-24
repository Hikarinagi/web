import type { ReadingPosition, ReaderController } from '@ritojs/kit'
import type { Reader } from '@ritojs/core'
import { push } from 'notivue'
import type { ShallowRef } from 'vue'
import { computed, ref } from 'vue'
import type { BackendReaderVolumeState } from '~/components/hikari-reader/types'
import { toBackendPosition } from '../lib/storage'

export type ReaderBookmark = BackendReaderVolumeState['bookmarks'][number]

interface UseReaderBookmarksOptions {
  volumeId: number
  reader: ShallowRef<Reader | null>
  controller: ShallowRef<ReaderController | null>
  currentPosition: ShallowRef<ReadingPosition | null>
  initial: ReaderBookmark[]
}

export function useReaderBookmarks(options: UseReaderBookmarksOptions) {
  const list = ref<ReaderBookmark[]>([...options.initial])
  const sorted = computed(() =>
    [...list.value].sort(
      (a, b) =>
        Date.parse(b.modified_at ?? b.created_at) - Date.parse(a.modified_at ?? a.created_at),
    ),
  )

  const hasCurrent = computed(() => {
    const current = options.currentPosition.value
    if (!current) return false
    return list.value.some(item => samePosition(positionOf(item), current))
  })

  function findIndexByClientId(clientId: string) {
    return list.value.findIndex(item => item.client_id === clientId)
  }

  async function add(note?: string): Promise<ReaderBookmark | null> {
    const reader = options.reader.value
    if (!reader) return null
    if (hasCurrent.value) {
      push.warning({ message: '当前位置已有书签' })
      return null
    }
    const position = options.currentPosition.value
    if (!position) return null
    const clientId = generateClientId()

    const chapterEntry = position
      ? reader.findActiveTocEntry(position.projection.pageIndex)
      : undefined
    const optimistic: ReaderBookmark = {
      id: -Date.now(),
      client_id: clientId,
      position: toBackendPosition(position),
      chapter_index: null,
      chapter_href: chapterEntry?.href ?? null,
      chapter_title: chapterEntry?.label ?? null,
      text: null,
      note: note ?? null,
      created_at: new Date().toISOString(),
      modified_at: null,
    }
    list.value = [optimistic, ...list.value]

    try {
      const saved = await hikariRequest('/api/v3/reader/volumes/{volume_id}/bookmarks', {
        method: 'post',
        path: { volume_id: options.volumeId },
        body: {
          client_id: clientId,
          position: optimistic.position,
          chapter_href: optimistic.chapter_href ?? undefined,
          chapter_title: optimistic.chapter_title ?? undefined,
          note: optimistic.note ?? undefined,
        },
        toast: false,
      })
      const idx = findIndexByClientId(clientId)
      if (idx !== -1) {
        list.value = list.value.map((item, i) => (i === idx ? saved : item))
      }
      push.success({ message: '已添加书签' })
      return saved
    } catch {
      const idx = findIndexByClientId(clientId)
      if (idx !== -1) list.value = list.value.filter((_, i) => i !== idx)
      push.error({ message: '添加书签失败，请稍后重试' })
      return null
    }
  }

  async function update(id: number, patch: { note?: string | null }) {
    const idx = list.value.findIndex(item => item.id === id)
    if (idx === -1) return
    const previous = list.value[idx]!
    const optimistic: ReaderBookmark = {
      ...previous,
      note: patch.note ?? null,
      modified_at: new Date().toISOString(),
    }
    list.value = list.value.map((item, i) => (i === idx ? optimistic : item))

    try {
      const saved = await hikariRequest('/api/v3/reader/bookmarks/{id}', {
        method: 'patch',
        path: { id },
        body: {
          note: patch.note ?? null,
        },
        toast: false,
      })
      list.value = list.value.map(item => (item.id === id ? saved : item))
    } catch {
      list.value = list.value.map(item => (item.id === id ? previous : item))
      push.error({ message: '更新书签失败，请稍后重试' })
    }
  }

  async function remove(id: number) {
    const idx = list.value.findIndex(item => item.id === id)
    if (idx === -1) return
    const removed = list.value[idx]!
    list.value = list.value.filter(item => item.id !== id)

    try {
      await hikariRequest('/api/v3/reader/bookmarks/{id}', {
        method: 'delete',
        path: { id },
        toast: false,
      })
    } catch {
      list.value = [...list.value, removed].sort(
        (a, b) =>
          Date.parse(b.modified_at ?? b.created_at) - Date.parse(a.modified_at ?? a.created_at),
      )
      push.error({ message: '删除书签失败，请稍后重试' })
    }
  }

  function jumpTo(bookmark: ReaderBookmark) {
    const controller = options.controller.value
    const position = positionOf(bookmark)
    if (!controller || !position) return
    controller.goToPosition(position)
  }

  return {
    list: sorted,
    hasCurrent,
    add,
    update,
    remove,
    jumpTo,
  }
}

function generateClientId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `bookmark-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function positionOf(bookmark: ReaderBookmark): ReadingPosition | null {
  if (bookmark.position) return bookmark.position as unknown as ReadingPosition
  return null
}

function samePosition(a: ReadingPosition | null, b: ReadingPosition) {
  if (!a) return false
  const left = a.locator
  const right = b.locator
  if (!left || !right) {
    return (
      a.projection.spreadIndex === b.projection.spreadIndex &&
      a.projection.pageIndex === b.projection.pageIndex
    )
  }
  if (left.spineIdref !== right.spineIdref) return false
  if (left.sourcePoint && right.sourcePoint) {
    return (
      left.sourcePoint.textOffset === right.sourcePoint.textOffset &&
      samePath(left.sourcePoint.nodePath, right.sourcePoint.nodePath)
    )
  }
  return Math.abs(left.chapterProgress - right.chapterProgress) < 0.001
}

function samePath(a: readonly number[], b: readonly number[]) {
  if (a.length !== b.length) return false
  return a.every((value, index) => value === b[index])
}

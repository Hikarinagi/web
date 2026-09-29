import { toast } from '@hina-ui/vue'
import { isApiError } from '~/utils/api/error'
import { sortKeyBetween, type Point } from '../geometry'
import type { BackendMangaRegion, MangaRegionChange } from '../manga'

export type EditableRegion = BackendMangaRegion & {
  persisted: boolean
  rev: number
  dirty: boolean
}

type RegionPatch = Partial<
  Pick<
    BackendMangaRegion,
    'vertices' | 'x' | 'y' | 'position' | 'source_text' | 'style' | 'sort_key'
  >
>

const LOCK_RETRY_MS = 15_000

export function useMangaRegions(projectId: () => number, initial: BackendMangaRegion[]) {
  const auth = useAuthStore()
  const adopt = (region: BackendMangaRegion): EditableRegion => ({
    ...region,
    persisted: true,
    rev: 0,
    dirty: false,
  })
  const latest = (rows: BackendMangaRegion['translations']) =>
    Math.max(0, ...rows.map(row => new Date(row.updated_at).getTime()))
  const regions = ref<EditableRegion[]>(initial.map(adopt))
  const deleted = reactive(new Map<string, { page_id: number; version: number }>())
  const stale = reactive(new Set<number>())
  const locked = new Set<number>()
  const loads = new Map<number, number>()
  const selectedId = ref<string | null>(null)
  const saving = ref(false)
  let running: Promise<boolean> | null = null
  let warned = false

  const byPage = computed(() => {
    const pages = new Map<number, EditableRegion[]>()
    for (const region of regions.value) {
      const list = pages.get(region.page_id) ?? []
      list.push(region)
      pages.set(region.page_id, list)
    }
    for (const list of pages.values()) {
      list.sort((a, b) => a.sort_key - b.sort_key || a.id.localeCompare(b.id))
    }
    return pages
  })
  const selected = computed(
    () => regions.value.find(region => region.id === selectedId.value) ?? null,
  )
  const dirtyPages = computed(
    () =>
      new Set([
        ...regions.value.filter(region => region.dirty).map(region => region.page_id),
        ...[...deleted.values()].map(entry => entry.page_id),
      ]),
  )
  const dirty = computed(() => dirtyPages.value.size > 0)
  const find = (id: string) => regions.value.find(region => region.id === id)
  const of = (pageId: number) => byPage.value.get(pageId) ?? []

  function merge(
    rows: BackendMangaRegion[],
    pageId: number | null = null,
    discard = new Set<string>(),
  ) {
    const incoming = new Map(rows.map(row => [row.id, row]))
    const next: EditableRegion[] = []
    for (const region of regions.value) {
      const row = incoming.get(region.id)
      if (pageId !== null && region.page_id !== pageId) next.push(region)
      else if (discard.has(region.id)) {
        if (row) next.push(adopt(row))
      } else if (region.dirty || !region.persisted) next.push(region)
      else if (row && row.version < region.version) next.push(region)
      else if (row && latest(region.translations) > latest(row.translations)) {
        next.push({ ...adopt(row), translations: region.translations, state: region.state })
      } else if (row) next.push(adopt(row))
    }
    const present = new Set(next.map(region => region.id))
    for (const row of rows) {
      if (!present.has(row.id) && !deleted.has(row.id)) next.push(adopt(row))
    }
    regions.value = next
    if (selectedId.value && !find(selectedId.value)) selectedId.value = null
  }

  function sync(pageIds: number[], rows: BackendMangaRegion[]) {
    const alive = new Set(pageIds)
    for (const [id, entry] of deleted) if (!alive.has(entry.page_id)) deleted.delete(id)
    const kept = regions.value.filter(region => alive.has(region.page_id))
    const known = new Set([...kept.map(region => region.page_id), ...dirtyPages.value])
    const fresh = rows.filter(row => !known.has(row.page_id) && !deleted.has(row.id))
    regions.value = [...kept, ...fresh.map(adopt)]
    if (selectedId.value && !find(selectedId.value)) selectedId.value = null
  }

  async function reload(pageId: number, force = false) {
    const discard = new Set<string>()
    if (force) {
      for (const region of regions.value) {
        if (region.page_id === pageId && (region.dirty || !region.persisted)) discard.add(region.id)
      }
      for (const [id, entry] of deleted) if (entry.page_id === pageId) discard.add(id)
    }
    const ticket = (loads.get(pageId) ?? 0) + 1
    loads.set(pageId, ticket)
    const rows = await hikariRequest('/api/v3/manga-project-pages/{page_id}/regions', {
      path: { page_id: pageId },
    })
    if (loads.get(pageId) !== ticket) return
    for (const id of discard) deleted.delete(id)
    merge(rows, pageId, discard)
    stale.delete(pageId)
  }

  async function refreshAll() {
    const rows = await hikariRequest('/api/v3/manga-projects/{project_id}/regions', {
      path: { project_id: projectId() },
    })
    merge(rows)
  }

  async function savePage(pageId: number): Promise<boolean> {
    const pending = regions.value.filter(region => region.page_id === pageId && region.dirty)
    const removed = [...deleted.entries()].filter(([, entry]) => entry.page_id === pageId)
    if (!pending.length && !removed.length) return true
    const snapshot = new Map(pending.map(region => [region.id, region.rev]))
    try {
      const result = await hikariRequest('/api/v3/manga-project-pages/{page_id}/regions', {
        method: 'put',
        path: { page_id: pageId },
        body: {
          upserts: pending.map(region => ({
            id: region.id,
            sort_key: region.sort_key,
            x: region.x,
            y: region.y,
            vertices: region.vertices as Point[],
            position: region.position,
            source_text: region.source_text,
            style: region.style,
            ...(region.persisted ? { base_version: region.version } : {}),
          })),
          deletes: removed.map(([id, entry]) => ({ id, base_version: entry.version })),
        },
        toast: false,
      })
      for (const [id] of removed) deleted.delete(id)
      for (const row of result.versions) {
        const region = find(row.id)
        if (!region) {
          deleted.set(row.id, { page_id: pageId, version: row.version })
          continue
        }
        region.version = row.version
        region.persisted = true
        if (region.rev === snapshot.get(row.id)) region.dirty = false
      }
      locked.delete(pageId)
      return true
    } catch (error) {
      if (isApiError(error) && error.code === 'MANGA_TEXT_REGION_CONFLICT') {
        toast.warning('此页面上的文本框已被另一位成员更改。最新内容已加载。')
        await reload(pageId, true)
      } else if (isApiError(error) && error.code === 'MANGA_TEXT_REGION_LOCKED') {
        if (!locked.has(pageId)) toast.warning('其他成员正在编辑某些文本框。请稍后保存。')
        locked.add(pageId)
        setTimeout(() => void flush(), LOCK_RETRY_MS)
      } else {
        toast.danger(isApiError(error) ? error.message : '保存失败。请稍后重试。')
      }
      return false
    }
  }

  async function save(): Promise<boolean> {
    while (running) await running
    if (!dirtyPages.value.size) return true
    running = (async () => {
      saving.value = true
      let ok = true
      try {
        for (const pageId of [...dirtyPages.value]) ok = (await savePage(pageId)) && ok
        if (dirtyPages.value.size && ok) void flush()
        return ok
      } finally {
        saving.value = false
        running = null
      }
    })()
    return running
  }

  const flush = useDebounceFn(() => save(), 1200)

  function create(pageId: number, fields: { vertices: Point[]; x: number; y: number }) {
    const list = of(pageId)
    const anchor = selected.value?.page_id === pageId ? selected.value : list.at(-1)
    const index = anchor ? list.findIndex(region => region.id === anchor.id) : -1
    const region: EditableRegion = {
      id: crypto.randomUUID(),
      page_id: pageId,
      sort_key: sortKeyBetween(anchor?.sort_key, list[index + 1]?.sort_key),
      ...fields,
      position: 'INSIDE',
      source_text: '',
      machine: false,
      style: null,
      state: 0,
      version: 0,
      locked_by: null,
      lock_expires_at: null,
      translations: [],
      persisted: false,
      rev: 1,
      dirty: true,
    }
    regions.value.push(region)
    selectedId.value = region.id
    void flush()
    return region
  }

  function update(id: string, patch: RegionPatch) {
    const region = find(id)
    if (!region) return
    Object.assign(region, patch)
    region.rev += 1
    region.dirty = true
    void flush()
  }

  function remove(id: string) {
    const region = find(id)
    if (!region) return
    if (region.persisted) deleted.set(id, { page_id: region.page_id, version: region.version })
    regions.value = regions.value.filter(item => item.id !== id)
    if (selectedId.value === id) selectedId.value = null
    void flush()
  }

  function move(id: string, direction: -1 | 1) {
    const region = find(id)
    if (!region) return
    const list = of(region.page_id)
    const index = list.findIndex(item => item.id === id)
    const target = index + direction
    if (target < 0 || target >= list.length) return
    const before = direction < 0 ? list[target - 1] : list[target]
    const after = direction < 0 ? list[target] : list[target + 1]
    update(id, { sort_key: sortKeyBetween(before?.sort_key, after?.sort_key) })
  }

  function applyChange(change: MangaRegionChange) {
    if (change.page_id === null) return
    const own = change.actor_id === auth.user?.id
    if (change.kind === 'lock' || change.kind === 'unlock') {
      if (own) return
      for (const id of change.region_ids) {
        const region = find(id)
        if (!region) continue
        region.locked_by = change.locked_by ?? null
        region.lock_expires_at = change.lock_expires_at ?? null
      }
      return
    }
    const remote = !own && ['regions', 'translation', 'state'].includes(change.kind)
    if (change.kind !== 'task' && !remote) return
    if (dirtyPages.value.has(change.page_id)) stale.add(change.page_id)
    else void reload(change.page_id)
  }

  useEventListener('beforeunload', event => {
    if (dirty.value) event.preventDefault()
  })
  onBeforeRouteLeave(async () => {
    if ((await save()) || !dirty.value || warned) return true
    warned = true
    toast.warning('某些更改尚未保存。再次离开以丢弃它们。')
    return false
  })
  onBeforeUnmount(() => {
    void save()
  })

  return {
    regions,
    selected,
    selectedId,
    saving,
    stale,
    dirty,
    of,
    find,
    sync,
    reload,
    refreshAll,
    save,
    create,
    update,
    remove,
    move,
    applyChange,
  }
}

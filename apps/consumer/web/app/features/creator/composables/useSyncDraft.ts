import type { FormInstance } from '@primevue/forms/form'
import { WORKSPACE_SESSION_KEY } from '~/features/creator/composables/useWorkspaceSession'
import type { EditorRelationRow } from '~/features/creator/editor/relation'
import {
  MEDIA_FIELD,
  readExternalIds,
  relationCandidates,
  scalarCandidates,
  syncConfig,
  type ExternalIds,
  type LnRoster,
  type RelationCandidate,
  type ScalarCandidate,
  type SyncField,
  type SyncRoster,
} from '~/features/creator/editor/sync'

interface DraftResult {
  draft: Record<string, unknown>
  field_sources: Record<string, string>
  relations: RelationCandidate[]
  cover: string | null
  author: LnRoster['author']
  screenshots: ScreenshotCandidate[]
}

export interface ScreenshotCandidate {
  url: string
  sexual: number
  violence: number
}

export interface TagCandidate {
  matched_id: number
  name: string
}

export function useSyncDraft(params: {
  resourceType: () => string
  resourceId: () => number | null | undefined
  formEl: () => FormInstance | null
  fields: () => SyncField[]
  relations: () => Record<string, EditorRelationRow[]>
  onRoster?: (roster: SyncRoster) => void
}) {
  const session = inject(WORKSPACE_SESSION_KEY, null)
  const cfg = computed(() => syncConfig(params.resourceType()))
  const coverField = computed(() => MEDIA_FIELD[params.resourceType()] ?? null)

  const visible = ref(false)
  const loading = ref(false)
  const noIds = ref(false)
  const failed = ref(false)
  const queried = ref<ExternalIds>({})
  const scalars = ref<ScalarCandidate[]>([])
  const rels = ref<RelationCandidate[]>([])
  const cover = ref<string | null>(null)
  const author = ref<LnRoster['author']>(null)
  const screenshots = ref<ScreenshotCandidate[]>([])
  const tags = ref<TagCandidate[]>([])

  const nothing = computed(
    () =>
      !loading.value &&
      !noIds.value &&
      !failed.value &&
      !scalars.value.length &&
      !rels.value.length &&
      !cover.value &&
      !author.value &&
      !screenshots.value.length &&
      !tags.value.length,
  )
  const comparedSources = computed(() =>
    [
      queried.value.bangumi_id ? `Bangumi ${queried.value.bangumi_id}` : null,
      queried.value.vndb_id ? `VNDB ${queried.value.vndb_id}` : null,
    ]
      .filter(Boolean)
      .join(' · '),
  )

  function currentValues(): Record<string, unknown> {
    const states = params.formEl()?.states ?? {}
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(states)) out[k] = (v as { value?: unknown })?.value
    return out
  }

  const toRel = (
    rs: {
      matched_id: number
      name: string
      cover: string | null
      relation: string
      source: string
    }[],
  ) =>
    rs.map(r => ({
      target_id: r.matched_id,
      name: r.name,
      cover: r.cover,
      relation: r.relation,
      source: r.source,
    }))

  let pendingTags: TagCandidate[] = []

  async function fetchDraft(ids: ExternalIds): Promise<DraftResult> {
    const t = params.resourceType()
    pendingTags = []
    if (t === 'galgame') {
      const r = await hikariRequest('/api/v3/external-source/galgame-draft', { query: ids })
      params.onRoster?.({
        kind: 'galgame',
        galgame: {
          producers: r.producers,
          staff: r.staff,
          characters: r.characters,
          tags: r.tags,
        },
      })
      const currentTags = new Set((params.relations().tags ?? []).map(row => row.target_id))
      pendingTags = r.tags
        .filter(
          (tag): tag is typeof tag & { matched_id: number } =>
            tag.matched_id != null && !currentTags.has(tag.matched_id),
        )
        .map(tag => ({ matched_id: tag.matched_id, name: tag.name }))
      return {
        draft: r.draft,
        field_sources: r.field_sources,
        relations: toRel(r.relations),
        cover: null,
        author: null,
        screenshots: r.screenshots,
      }
    }
    if (t === 'light-novel') {
      const r = await hikariRequest('/api/v3/external-source/light-novel-draft', {
        query: { bangumi_id: ids.bangumi_id! },
      })
      params.onRoster?.({
        kind: 'light-novel',
        ln: {
          author: r.author,
          illustrators: r.illustrators,
          publishers: r.publishers,
          characters: r.characters,
        },
      })
      return {
        draft: r.draft,
        field_sources: r.field_sources,
        relations: toRel(r.relations),
        cover: null,
        author: r.author,
        screenshots: [],
      }
    }
    if (t === 'light-novel-volume') {
      const r = await hikariRequest('/api/v3/external-source/light-novel-volume-draft', {
        query: { bangumi_id: ids.bangumi_id! },
      })
      return {
        draft: r.draft,
        field_sources: r.field_sources,
        relations: [],
        cover: null,
        author: null,
        screenshots: [],
      }
    }
    const r = await hikariRequest('/api/v3/external-source/entity-draft', {
      query: { type: t as 'person' | 'character' | 'producer', ...ids },
    })
    return {
      draft: r.draft,
      field_sources: r.field_sources,
      relations: [],
      cover: r.cover,
      author: null,
      screenshots: [],
    }
  }

  async function open() {
    visible.value = true
    loading.value = true
    noIds.value = false
    failed.value = false
    scalars.value = []
    rels.value = []
    cover.value = null
    author.value = null
    screenshots.value = []
    tags.value = []
    const values = currentValues()
    const resourceId = params.resourceId()
    const own = readExternalIds(params.resourceType(), values)
    if (resourceId != null && session && (!own?.bangumi_id || !own?.vndb_id)) {
      await session.ensureRosterHints()
    }
    const hint =
      resourceId != null
        ? (session?.rosterHints.value.get(`${params.resourceType()}:${resourceId}`) ?? null)
        : null
    const ids =
      own || hint
        ? {
            bangumi_id: own?.bangumi_id ?? hint?.bangumi_id,
            vndb_id: own?.vndb_id ?? hint?.vndb_id,
          }
        : null
    queried.value = ids ?? {}
    if (!ids) {
      noIds.value = true
      loading.value = false
      return
    }
    try {
      const result = await fetchDraft(ids)
      const skip = new Set(
        [
          cfg.value?.bangumiField && values[cfg.value.bangumiField] != null
            ? cfg.value.bangumiField
            : null,
          cfg.value?.vndbField && values[cfg.value.vndbField] != null ? cfg.value.vndbField : null,
          'id',
        ].filter(Boolean) as string[],
      )
      scalars.value = scalarCandidates(
        result.draft,
        values,
        params.fields(),
        skip,
        result.field_sources,
      )
      const relField = cfg.value?.relationField
      const current = new Set(
        (relField ? (params.relations()[relField] ?? []) : []).map(r => r.target_id),
      )
      rels.value = relationCandidates(result.relations, current)
      const mediaField = coverField.value
      cover.value = mediaField && !values[mediaField] && result.cover ? result.cover : null
      author.value = result.author && values.author_id == null ? result.author : null
      const currentImages = params.relations().images ?? []
      screenshots.value = currentImages.length ? [] : result.screenshots
      tags.value = pendingTags
    } catch {
      failed.value = true
    } finally {
      loading.value = false
    }
  }

  return {
    cfg,
    coverField,
    visible,
    loading,
    noIds,
    failed,
    scalars,
    rels,
    cover,
    author,
    screenshots,
    tags,
    nothing,
    comparedSources,
    open,
  }
}

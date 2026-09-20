import type { ApiData } from '@hikarinagi/api-contract/v3'
import { relationRefValues, type EditorRelationRow } from './relation'

export type GalgameRoster = Pick<
  ApiData<'/api/v3/external-source/galgame-draft', 'get'>,
  'producers' | 'staff' | 'characters' | 'tags'
>

export type LnRoster = Pick<
  ApiData<'/api/v3/external-source/light-novel-draft', 'get'>,
  'author' | 'illustrators' | 'publishers' | 'characters'
>

export type SyncRoster =
  | { kind: 'galgame'; galgame: GalgameRoster }
  | { kind: 'light-novel'; ln: LnRoster }

export interface RosterHintEntry {
  target: 'person' | 'producer' | 'character'
  id: number | null
  external: { bangumi_id?: string; vndb_id?: string }
}

export function rosterHintEntries(roster: SyncRoster): RosterHintEntry[] {
  const out: RosterHintEntry[] = []
  if (roster.kind === 'galgame') {
    for (const p of roster.galgame.producers) {
      out.push({ target: 'producer', id: p.matched_id, external: p.external })
    }
    for (const s of roster.galgame.staff) {
      out.push({ target: 'person', id: s.matched_id, external: s.external })
    }
    for (const c of roster.galgame.characters) {
      out.push({ target: 'character', id: c.matched_id, external: c.external })
      for (const a of c.actors)
        out.push({ target: 'person', id: a.matched_id, external: a.external })
    }
    return out
  }
  if (roster.ln.author) {
    out.push({
      target: 'person',
      id: roster.ln.author.matched_id,
      external: roster.ln.author.external,
    })
  }
  for (const i of roster.ln.illustrators) {
    out.push({ target: 'person', id: i.matched_id, external: i.external })
  }
  for (const p of roster.ln.publishers) {
    out.push({ target: 'producer', id: p.matched_id, external: p.external })
  }
  for (const c of roster.ln.characters) {
    out.push({ target: 'character', id: c.matched_id, external: c.external })
  }
  return out
}

export function suggestionSourceOf(
  syncRoster: SyncRoster | null,
  prefillRelations: GalgameRoster | null | undefined,
): SyncRoster | null {
  if (syncRoster) return syncRoster
  return prefillRelations ? { kind: 'galgame', galgame: prefillRelations } : null
}

export interface SyncConfig {
  bangumiField?: string
  vndbField?: string
  vndbPrefix?: boolean
  relationField?: string
  relationEnum?: string
}

const SYNC_CONFIG: Record<string, SyncConfig> = {
  galgame: {
    bangumiField: 'bangumi_game_id',
    vndbField: 'vndb_id',
    vndbPrefix: true,
    relationField: 'source_relations',
    relationEnum: 'GalgameRelationType',
  },
  'light-novel': {
    bangumiField: 'bangumi_book_id',
    relationField: 'source_relations',
    relationEnum: 'NovelRelationType',
  },
  'light-novel-volume': { bangumiField: 'bangumi_book_id' },
  person: { bangumiField: 'bangumi_id', vndbField: 'vndb_id' },
  character: { bangumiField: 'bangumi_id', vndbField: 'vndb_id' },
  producer: { bangumiField: 'bangumi_id', vndbField: 'vndb_id' },
}

export function syncConfig(resourceType: string): SyncConfig | null {
  return SYNC_CONFIG[resourceType] ?? null
}

export const MEDIA_FIELD: Record<string, string> = {
  person: 'image',
  character: 'image',
  producer: 'logo',
}

export interface ExternalIds {
  bangumi_id?: string
  vndb_id?: string
}

export function readExternalIds(
  resourceType: string,
  values: Record<string, unknown>,
): ExternalIds | null {
  const cfg = SYNC_CONFIG[resourceType]
  if (!cfg) return null
  const str = (v: unknown) => (v == null || v === '' ? undefined : String(v))
  const bangumi_id = cfg.bangumiField ? str(values[cfg.bangumiField]) : undefined
  let vndb_id = cfg.vndbField ? str(values[cfg.vndbField]) : undefined
  if (vndb_id && cfg.vndbPrefix) vndb_id = `v${vndb_id}`
  return bangumi_id || vndb_id ? { bangumi_id, vndb_id } : null
}

export interface SyncField {
  field: string
  kind: string
  value_type?: string
}

export interface ScalarCandidate {
  field: string
  value_type?: string
  from: unknown
  to: unknown
  source?: string
  conflict: boolean
}
export interface RelationCandidate {
  target_id: number
  name: string
  cover: string | null
  relation: string
  source: string
}

function isEmpty(v: unknown): boolean {
  return v == null || v === '' || (Array.isArray(v) && v.length === 0)
}

function sameValue(a: unknown, b: unknown, valueType?: string): boolean {
  if (valueType === 'date') {
    const ta = a == null || a === '' ? NaN : new Date(a as string | Date).getTime()
    const tb = b == null || b === '' ? NaN : new Date(b as string | Date).getTime()
    return ta === tb || (Number.isNaN(ta) && Number.isNaN(tb))
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    return JSON.stringify([...a].sort()) === JSON.stringify([...b].sort())
  }
  return a === b
}

function ownScalarValues(source: Record<string, unknown>): Set<string> {
  const out = new Set<string>()
  for (const value of Object.values(source)) {
    if (typeof value === 'string' && value.trim()) out.add(value.trim())
  }
  return out
}

export function scalarCandidates(
  draft: Record<string, unknown>,
  current: Record<string, unknown>,
  fields: SyncField[],
  skip: Set<string>,
  fieldSources: Record<string, string>,
): ScalarCandidate[] {
  const byField = new Map(fields.filter(f => f.kind !== 'relation').map(f => [f.field, f]))
  const own = ownScalarValues(current)
  const out: ScalarCandidate[] = []
  for (const [field, to] of Object.entries(draft)) {
    const f = byField.get(field)
    if (!f || skip.has(field) || isEmpty(to)) continue
    const from = current[field]
    if (Array.isArray(to)) {
      const fromList = Array.isArray(from) ? from : []
      const additions = to.filter(item => {
        if (item == null || item === '' || fromList.includes(item)) return false
        if (typeof item === 'string' && own.has(item.trim())) return false
        return true
      })
      if (additions.length === 0) continue
      out.push({
        field,
        value_type: f.value_type,
        from,
        to: [...fromList, ...additions],
        source: fieldSources[field],
        conflict: false,
      })
      continue
    }
    if (sameValue(to, from, f.value_type)) continue
    out.push({
      field,
      value_type: f.value_type,
      from,
      to,
      source: fieldSources[field],
      conflict: !isEmpty(from),
    })
  }
  return out
}

export function buildFillEmptyOps(
  draft: Record<string, unknown>,
  fieldSources: Record<string, string>,
  values: Record<string, unknown>,
  fields: SyncField[],
): Record<string, unknown>[] {
  const skip = new Set(
    ['id', 'bangumi_id', 'vndb_id'].filter(
      field => field === 'id' || (values[field] != null && values[field] !== ''),
    ),
  )
  return scalarCandidates(draft, values, fields, skip, fieldSources)
    .filter(candidate => !candidate.conflict)
    .map(candidate => ({
      kind: 'scalar',
      field: candidate.field,
      value_type: candidate.value_type,
      from: candidate.from ?? null,
      to: candidate.to,
    }))
}

export function collectBackfillMembers(
  roster: SyncRoster | null,
  relations: Record<string, EditorRelationRow[]>,
): {
  target: 'person' | 'producer' | 'character'
  id: number
  name: string
  cover: string | null
  externals: { bangumi_id?: string; vndb_id?: string }
  sourceNames: string[]
}[] {
  if (!roster) return []
  const linked = (field: string) => new Set((relations[field] ?? []).map(row => row.target_id))
  const out = new Map<string, ReturnType<typeof collectBackfillMembers>[number]>()
  const put = (
    target: 'person' | 'producer' | 'character',
    ids: Set<number>,
    entries: {
      matched_id: number | null
      name: string
      cover?: string | null
      external: { bangumi_id?: string; vndb_id?: string }
      source_names?: string[]
    }[],
  ) => {
    for (const entry of entries) {
      if (entry.matched_id == null || !ids.has(entry.matched_id)) continue
      const key = `${target}:${entry.matched_id}`
      const existing = out.get(key)
      if (existing) {
        existing.externals = { ...entry.external, ...existing.externals }
        continue
      }
      out.set(key, {
        target,
        id: entry.matched_id,
        name: entry.name,
        cover: entry.cover ?? null,
        externals: { ...entry.external },
        sourceNames: entry.source_names ?? [],
      })
    }
  }
  if (roster.kind === 'galgame') {
    const actorIds = new Set(
      (relations.characters ?? []).flatMap(row =>
        relationRefValues(row, 'actors').map(value => value.id),
      ),
    )
    put('producer', linked('producers'), roster.galgame.producers)
    put('person', linked('staffs'), roster.galgame.staff)
    put('character', linked('characters'), roster.galgame.characters)
    put(
      'person',
      actorIds,
      roster.galgame.characters.flatMap(character => character.actors),
    )
  } else {
    put('person', linked('illustrators'), roster.ln.illustrators)
    put('producer', linked('publishers'), roster.ln.publishers)
    put('character', linked('characters'), roster.ln.characters)
  }
  return [...out.values()]
}

export function relationCandidates(
  source: RelationCandidate[],
  currentTargetIds: Set<number>,
): RelationCandidate[] {
  const seen = new Set<number>()
  const out: RelationCandidate[] = []
  for (const r of source) {
    if (currentTargetIds.has(r.target_id) || seen.has(r.target_id)) continue
    seen.add(r.target_id)
    out.push(r)
  }
  return out
}

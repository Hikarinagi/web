import type { ApiQuery } from '@hikarinagi/api-contract/v3'
import type { EditorRelationRow } from '~/features/creator/editor/relation'

export type ImportType = NonNullable<
  ApiQuery<'/api/v3/external-source/{source}/search', 'get'>
>['type']

interface MatchedEntity {
  matched_id: number | null
  name: string
  cover?: string | null
}

export function seedPrefill(
  prefill: Record<string, unknown> | undefined,
  rel: Parameters<typeof prefillRelationRows>[0] | null | undefined,
): Record<string, unknown> | undefined {
  if (!prefill) return undefined
  return { ...prefill, ...(rel ? prefillRelationRows(rel) : {}) }
}

export function prefillRelationRows(rel: {
  producers: (MatchedEntity & { role?: string })[]
  staff: (MatchedEntity & { role: string })[]
  characters: (MatchedEntity & { role: string; actors: MatchedEntity[] })[]
  relations?: { matched_id: number; name: string; cover: string | null; relation: string }[] | null
  tags?: { name: string; matched_id: number | null }[] | null
}): Record<string, EditorRelationRow[]> {
  const out: Record<string, EditorRelationRow[]> = {}
  const producers = rel.producers
    .filter(p => p.matched_id != null)
    .map(p => ({
      target_id: p.matched_id as number,
      target: { name: p.name, cover: p.cover ?? null },
      attributes: { role: p.role },
    }))
  const staffs = rel.staff
    .filter(s => s.matched_id != null)
    .map(s => ({
      target_id: s.matched_id as number,
      target: { name: s.name, cover: s.cover ?? null },
      attributes: { role: s.role },
    }))
  const characters = rel.characters
    .filter(c => c.matched_id != null)
    .map(c => ({
      target_id: c.matched_id as number,
      target: { name: c.name, cover: c.cover ?? null },
      attributes: { role: c.role },
      ref_attributes: {
        actors: c.actors
          .filter(a => a.matched_id != null)
          .map(a => ({ id: a.matched_id as number, name: a.name, cover: a.cover ?? null })),
      },
    }))
  const sourceRelations = (rel.relations ?? []).map(r => ({
    target_id: r.matched_id,
    target: { name: r.name, cover: r.cover },
    attributes: { relation: r.relation },
  }))
  const tags = (rel.tags ?? [])
    .filter(t => t.matched_id != null)
    .map(t => ({
      target_id: t.matched_id as number,
      target: { name: t.name, cover: null },
      attributes: {},
    }))
  if (producers.length) out.producers = producers
  if (staffs.length) out.staffs = staffs
  if (characters.length) out.characters = characters
  if (sourceRelations.length) out.source_relations = sourceRelations
  if (tags.length) out.tags = tags
  return out
}

export const IMPORT_TYPES: ImportType[] = [
  'galgame',
  'light-novel',
  'light-novel-volume',
  'person',
  'character',
  'producer',
]

export function canImport(type: string): type is ImportType {
  return (IMPORT_TYPES as string[]).includes(type)
}

export function hasVndb(type: ImportType): boolean {
  return type !== 'light-novel' && type !== 'light-novel-volume'
}

export function oneClickEndpoint(
  type: ImportType,
): '/api/v3/galgame-import' | '/api/v3/light-novel-import' | null {
  if (type === 'galgame') return '/api/v3/galgame-import'
  if (type === 'light-novel') return '/api/v3/light-novel-import'
  return null
}

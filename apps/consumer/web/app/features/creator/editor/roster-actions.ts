import { importProvisionalEntity } from './create-entity'
import { relationRefValues, type EditorRelationRow, type RelationRefValue } from './relation'
import type { GalgameRoster, LnRoster, SyncRoster } from './sync'

export type RosterActionGroup = '新增关联' | '关系修正'

export interface RosterActionContext {
  addRow: (field: string, row: EditorRelationRow) => void
  updateRow: (field: string, targetId: number, row: EditorRelationRow) => void
  removeRow: (field: string, targetId: number) => void
}

export interface RosterAction {
  key: string
  group: RosterActionGroup
  label: string
  op: Record<string, unknown>
  run: (ctx: RosterActionContext) => Promise<void>
}

type EntityTarget = 'person' | 'producer' | 'character'

interface RosterMember {
  matched_id: number | null
  name: string
  cover?: string | null
  role?: string
  external: { bangumi_id?: string; vndb_id?: string }
  source_names?: string[]
  duplicate_ids?: number[]
  actors?: RosterMember[]
}

function actorRefs(actors: RosterMember[]): RelationRefValue[] {
  return actors.map(actor => ({
    id: actor.matched_id ?? 0,
    name: actor.name,
    cover: actor.cover ?? null,
  }))
}

export function buildRosterActions(
  roster: SyncRoster,
  current: Record<string, EditorRelationRow[]> | undefined,
): RosterAction[] {
  const out: RosterAction[] = []
  const rowsOf = (field: string) => current?.[field] ?? []

  const addAdditions: AddAdditions = (
    target,
    field,
    typeLabel,
    members,
    attributesOf,
    withActors = false,
    roleKeyed = false,
  ) => {
    for (const member of members) {
      const memberAttrs = attributesOf(member)
      const roleVal = roleKeyed ? String(memberAttrs.role ?? '') : ''
      const dup =
        member.matched_id != null &&
        rowsOf(field).some(
          row =>
            row.target_id === member.matched_id &&
            (!roleKeyed || String(row.attributes.role ?? '') === roleVal),
        )
      if (dup) continue
      const attributes = Object.fromEntries(
        Object.entries(memberAttrs).filter(([, value]) => value != null),
      )
      const actors = withActors ? (member.actors ?? []) : []
      out.push({
        key: `add:${field}:${member.matched_id ?? member.name}${roleKeyed ? `:${roleVal}` : ''}`,
        group: '新增关联',
        label: typeLabel,
        op: {
          kind: 'relation_add',
          field,
          target_id: member.matched_id ?? '',
          target_name: member.name,
          target_cover: member.cover ?? '',
          attributes,
          ...(actors.length ? { ref_attributes: { actors: actorRefs(actors) } } : {}),
        },
        run: async ctx => {
          const entity =
            member.matched_id != null
              ? { id: member.matched_id, name: member.name, cover: member.cover ?? null }
              : await importProvisionalEntity({ type: target, external: member.external })
          if (!entity) return
          const resolved: RelationRefValue[] = []
          for (const actor of actors) {
            if (actor.matched_id != null) {
              resolved.push({ id: actor.matched_id, name: actor.name, cover: actor.cover ?? null })
              continue
            }
            if (!actor.external.bangumi_id && !actor.external.vndb_id) continue
            const imported = await importProvisionalEntity({
              type: 'person',
              external: actor.external,
            })
            if (imported) {
              resolved.push({ id: imported.id, name: imported.name, cover: imported.cover })
            }
          }
          ctx.addRow(field, {
            target_id: entity.id,
            target: { name: entity.name, cover: entity.cover },
            attributes: attributesOf(member),
            ...(resolved.length ? { ref_attributes: { actors: resolved } } : {}),
          })
        },
      })
    }
  }

  if (roster.kind === 'galgame') {
    buildGalgame(roster.galgame, out, rowsOf, addAdditions)
  } else {
    buildLn(roster.ln, addAdditions)
  }
  return out
}

type AddAdditions = (
  target: EntityTarget,
  field: string,
  typeLabel: string,
  members: RosterMember[],
  attributesOf: (member: RosterMember) => Record<string, unknown>,
  withActors?: boolean,
  roleKeyed?: boolean,
) => void

function buildGalgame(
  roster: GalgameRoster,
  out: RosterAction[],
  rowsOf: (field: string) => EditorRelationRow[],
  addAdditions: AddAdditions,
) {
  addAdditions('producer', 'producers', '厂商', roster.producers, member => ({
    role: member.role,
  }))
  addAdditions(
    'person',
    'staffs',
    'STAFF',
    roster.staff,
    member => ({ role: member.role }),
    false,
    true,
  )
  addAdditions(
    'character',
    'characters',
    '角色',
    roster.characters,
    member => ({ role: member.role }),
    true,
  )

  for (const member of roster.characters) {
    if (member.matched_id == null) continue
    const row = rowsOf('characters').find(r => r.target_id === member.matched_id)
    if (!row) continue
    const dbCharRole = String(row.attributes.role ?? '').toUpperCase()
    if (
      member.role &&
      row.attributes.role !== member.role &&
      !(member.role === 'SUPPORTING' && dbCharRole && dbCharRole !== 'SUPPORTING')
    ) {
      out.push({
        key: `fix:char-role:${member.matched_id}`,
        group: '关系修正',
        label: '角色',
        op: {
          kind: 'relation_update',
          field: 'characters',
          target_id: member.matched_id,
          target_name: member.name,
          target_cover: member.cover ?? '',
          attributes: { role: { from: row.attributes.role ?? null, to: member.role } },
        },
        run: ctx => {
          ctx.updateRow('characters', member.matched_id!, {
            ...row,
            attributes: { ...row.attributes, role: member.role },
          })
          return Promise.resolve()
        },
      })
    }
    const existingRefs = relationRefValues(row, 'actors')
    const currentActors = new Set(existingRefs.map(value => value.id))
    const missing = (member.actors ?? []).filter(
      actor =>
        (actor.matched_id != null && !currentActors.has(actor.matched_id)) ||
        (actor.matched_id == null && (actor.external.bangumi_id || actor.external.vndb_id)),
    )
    if (missing.length) {
      out.push({
        key: `fix:char-actors:${member.matched_id}`,
        group: '关系修正',
        label: '角色',
        op: {
          kind: 'relation_update',
          field: 'characters',
          target_id: member.matched_id,
          target_name: member.name,
          target_cover: member.cover ?? '',
          ref_attributes: {
            actors: { from: existingRefs, to: [...existingRefs, ...actorRefs(missing)] },
          },
        },
        run: async ctx => {
          const added: RelationRefValue[] = []
          for (const actor of missing) {
            if (actor.matched_id != null) {
              added.push({ id: actor.matched_id, name: actor.name, cover: actor.cover ?? null })
              continue
            }
            const imported = await importProvisionalEntity({
              type: 'person',
              external: actor.external,
            })
            if (imported) {
              added.push({ id: imported.id, name: imported.name, cover: imported.cover })
            }
          }
          if (!added.length) return
          ctx.updateRow('characters', member.matched_id!, {
            ...row,
            ref_attributes: {
              ...(row.ref_attributes ?? {}),
              actors: [...relationRefValues(row, 'actors'), ...added],
            },
          })
        },
      })
    }
  }

  for (const member of roster.characters) {
    if (member.matched_id == null) continue
    for (const duplicateId of member.duplicate_ids ?? []) {
      const duplicateRow = rowsOf('characters').find(r => r.target_id === duplicateId)
      if (!duplicateRow) continue
      out.push({
        key: `dedup:char:${member.matched_id}:${duplicateId}`,
        group: '关系修正',
        label: `角色（与 #${member.matched_id} ${member.name} 重复）`,
        op: {
          kind: 'relation_remove',
          field: 'characters',
          target_id: duplicateId,
          target_name: duplicateRow.target.name || '',
          target_cover: duplicateRow.target.cover ?? '',
          attributes: duplicateRow.attributes,
        },
        run: ctx => {
          ctx.removeRow('characters', duplicateId)
          return Promise.resolve()
        },
      })
    }
  }

  for (const member of roster.producers) {
    if (member.matched_id == null) continue
    const row = rowsOf('producers').find(r => r.target_id === member.matched_id)
    if (
      !row ||
      !member.role ||
      String(row.attributes.role ?? '').toUpperCase() === member.role.toUpperCase() ||
      String(row.attributes.role ?? '').toUpperCase() === 'LOCALIZER'
    ) {
      continue
    }
    out.push({
      key: `fix:producer-role:${member.matched_id}`,
      group: '关系修正',
      label: '厂商',
      op: {
        kind: 'relation_update',
        field: 'producers',
        target_id: member.matched_id,
        target_name: member.name,
        target_cover: member.cover ?? '',
        attributes: { role: { from: row.attributes.role ?? null, to: member.role } },
      },
      run: ctx => {
        ctx.updateRow('producers', member.matched_id!, {
          ...row,
          attributes: { ...row.attributes, role: member.role },
        })
        return Promise.resolve()
      },
    })
  }
}

function buildLn(roster: LnRoster, addAdditions: AddAdditions) {
  addAdditions('person', 'illustrators', '插画', roster.illustrators, () => ({}))
  addAdditions('producer', 'publishers', '出版方', roster.publishers, () => ({}))
  addAdditions('character', 'characters', '角色', roster.characters, () => ({}))
}

import type { InjectionKey } from 'vue'
import {
  releasePeriodsLabel,
  releaseRangeLabel,
  type GalgameBrowseState,
  type TagFilterGroup,
} from './explore'
import { langLabel } from './labels'
import { platformLabel } from './platforms'

type EntityKind = 'producer' | 'tag' | 'staff'

export interface BrowseChip {
  key: string
  kind: 'year' | 'platform' | 'lang' | EntityKind | 'dev'
  label: string
  remove: () => void
}

export function useBrowseFilter(
  state: () => GalgameBrowseState,
  update: (next: Partial<GalgameBrowseState>) => void,
) {
  const labels = reactive(new Map<string, string>())

  function remember(kind: EntityKind, entities: { id: number; name: string }[]) {
    for (const entity of entities) labels.set(`${kind}:${entity.id}`, entity.name)
  }

  function entityLabel(kind: EntityKind, id: number): string {
    return labels.get(`${kind}:${id}`) ?? `#${id}`
  }

  const chips = computed<BrowseChip[]>(() => {
    const s = state()
    const out: BrowseChip[] = []

    if (s.start_periods.length) {
      out.push({
        key: 'start-periods',
        kind: 'year',
        label: `开始: ${releasePeriodsLabel(s.start_periods)}`,
        remove: () => update({ start_periods: [] }),
      })
    } else if (s.start_from || s.start_to) {
      out.push({
        key: 'start',
        kind: 'year',
        label: `开始: ${releaseRangeLabel(s.start_from, s.start_to)}`,
        remove: () => update({ start_from: undefined, start_to: undefined }),
      })
    }
    if (s.end_periods.length) {
      out.push({
        key: 'end-periods',
        kind: 'year',
        label: `完结: ${releasePeriodsLabel(s.end_periods)}`,
        remove: () => update({ end_periods: [] }),
      })
    } else if (s.end_from || s.end_to) {
      out.push({
        key: 'end',
        kind: 'year',
        label: `完结: ${releaseRangeLabel(s.end_from, s.end_to)}`,
        remove: () => update({ end_from: undefined, end_to: undefined }),
      })
    }
    for (const code of s.platforms) {
      out.push({
        key: `platform:${code}`,
        kind: 'platform',
        label: platformLabel(code),
        remove: () => update({ platforms: s.platforms.filter(item => item !== code) }),
      })
    }
    for (const code of s.origin_lang) {
      out.push({
        key: `lang:${code}`,
        kind: 'lang',
        label: langLabel(code),
        remove: () => update({ origin_lang: s.origin_lang.filter(item => item !== code) }),
      })
    }
    for (const id of s.producer_ids) {
      out.push({
        key: `producer:${id}`,
        kind: 'producer',
        label: entityLabel('producer', id),
        remove: () => update({ producer_ids: s.producer_ids.filter(item => item !== id) }),
      })
    }
    s.tag_groups.forEach((group, index) => {
      out.push({
        key: `tag-group:${index}`,
        kind: 'tag',
        label: tagGroupLabel(group, id => entityLabel('tag', id)),
        remove: () => update({ tag_groups: s.tag_groups.filter((_, i) => i !== index) }),
      })
    })
    for (const id of s.staff_person_ids) {
      out.push({
        key: `staff:${id}`,
        kind: 'staff',
        label: entityLabel('staff', id),
        remove: () => update({ staff_person_ids: s.staff_person_ids.filter(item => item !== id) }),
      })
    }
    if (s.include_dev) {
      out.push({
        key: 'dev',
        kind: 'dev',
        label: '含开发中/中止',
        remove: () => update({ include_dev: false }),
      })
    }
    return out
  })

  function clear() {
    update({
      start_from: undefined,
      start_to: undefined,
      start_periods: [],
      end_from: undefined,
      end_to: undefined,
      end_periods: [],
      platforms: [],
      origin_lang: [],
      producer_ids: [],
      tag_groups: [],
      staff_person_ids: [],
      staff_role: undefined,
      include_dev: false,
    })
  }

  return { remember, entityLabel, chips, count: computed(() => chips.value.length), clear }
}

function tagGroupLabel(group: TagFilterGroup, labelOf: (id: number) => string): string {
  const labels = group.tag_ids.map(labelOf)
  const joiner = group.match === 'and' ? ' + ' : ' / '
  const prefix =
    group.op === 'include'
      ? group.match === 'and'
        ? '包含'
        : '包含任一'
      : group.match === 'and'
        ? '排除全部'
        : '排除任一'
  return `${prefix}: ${labels.join(joiner)}`
}

export type BrowseFilter = ReturnType<typeof useBrowseFilter>
export const BROWSE_FILTER_KEY: InjectionKey<BrowseFilter> = Symbol('galgame-browse-filter')

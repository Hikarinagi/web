import type { InjectionKey } from 'vue'
import type { BrowseChip, BrowseFilterRecall } from '~/features/browse/filter'
import { tagConditionLabel, tagConditions, withoutCondition } from '~/features/browse/tag-groups'
import { rangeText, yearRanges } from '~/features/browse/years'
import {
  MANGA_AUDIENCE_OPTIONS,
  MANGA_REGION_OPTIONS,
  statusText,
  type MangaBrowseState,
} from './explore'

export function useBrowseFilter(
  state: () => MangaBrowseState,
  update: (next: Partial<MangaBrowseState>) => void,
  genres: () => { key: string; name: string }[],
) {
  const labels = reactive(new Map<string, string>())

  function remember(kind: string, entities: { id: number; name: string }[]) {
    for (const entity of entities) labels.set(`${kind}:${entity.id}`, entity.name)
  }

  function entityLabel(kind: string, id: number): string {
    return labels.get(`${kind}:${id}`) ?? `#${id}`
  }

  const more = computed(() => {
    const s = state()
    return s.genre.length + (s.audience ? 1 : 0) + (s.region ? 1 : 0) + (s.magazine_id ? 1 : 0)
  })

  const chips = computed<BrowseChip[]>(() => {
    const s = state()
    const out: BrowseChip[] = tagConditions(s.tag_groups).map(condition => ({
      key: condition.key,
      label: tagConditionLabel(condition, id => entityLabel('tag', id)),
      tag: true,
      remove: () => update({ tag_groups: withoutCondition(s.tag_groups, condition) }),
    }))
    if (s.tag)
      out.push({
        key: 'tag-name',
        label: s.tag,
        tag: true,
        remove: () => update({ tag: undefined }),
      })
    if (s.serial_status)
      out.push({
        key: 'status',
        label: statusText(s.serial_status),
        remove: () => update({ serial_status: undefined }),
      })
    for (const range of yearRanges(s.years)) {
      out.push({
        key: `year:${range.from}`,
        label: rangeText(range),
        remove: () =>
          update({ years: s.years.filter(year => year < range.from || year > range.to) }),
      })
    }
    for (const key of s.genre) {
      out.push({
        key: `genre:${key}`,
        label: genres().find(genre => genre.key === key)?.name ?? key,
        remove: () => update({ genre: s.genre.filter(item => item !== key) }),
      })
    }
    if (s.audience)
      out.push({
        key: 'audience',
        label:
          MANGA_AUDIENCE_OPTIONS.find(option => option.value === s.audience)?.label ?? s.audience,
        remove: () => update({ audience: undefined }),
      })
    if (s.region)
      out.push({
        key: 'region',
        label: MANGA_REGION_OPTIONS.find(option => option.value === s.region)?.label ?? s.region,
        remove: () => update({ region: undefined }),
      })
    if (s.magazine_id) {
      const id = s.magazine_id
      out.push({
        key: `magazine:${id}`,
        label: entityLabel('magazine', id),
        remove: () => update({ magazine_id: undefined }),
      })
    }
    return out
  })

  const hidden: Partial<MangaBrowseState> = {
    genre: [],
    audience: undefined,
    region: undefined,
    magazine_id: undefined,
  }

  function clearMore() {
    update(hidden)
  }

  function clear() {
    update({ ...hidden, serial_status: undefined, years: [], tag: undefined, tag_groups: [] })
  }

  return {
    remember,
    entityLabel,
    chips,
    count: computed(() => chips.value.length),
    more,
    clearMore,
    clear,
  }
}

export type BrowseFilter = ReturnType<typeof useBrowseFilter> & BrowseFilterRecall
export const BROWSE_FILTER_KEY: InjectionKey<BrowseFilter> = Symbol('manga-browse-filter')

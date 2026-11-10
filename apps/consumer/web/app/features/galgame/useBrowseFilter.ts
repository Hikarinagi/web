import type { InjectionKey } from 'vue'
import type { BrowseChip, BrowseFilterRecall } from '~/features/browse/filter'
import { tagConditionLabel, tagConditions, withoutCondition } from '~/features/browse/tag-groups'
import { rangeText, yearRanges } from '~/features/browse/years'
import type { GalgameBrowseState } from './explore'
import { langLabel } from './labels'
import { platformLabel } from './platforms'

export function useBrowseFilter(
  state: () => GalgameBrowseState,
  update: (next: Partial<GalgameBrowseState>) => void,
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
    return (
      s.platforms.length +
      s.origin_lang.length +
      s.producer_ids.length +
      s.staff_person_ids.length +
      (s.include_dev ? 1 : 0)
    )
  })

  const chips = computed<BrowseChip[]>(() => {
    const s = state()
    const out: BrowseChip[] = tagConditions(s.tag_groups).map(condition => ({
      key: condition.key,
      label: tagConditionLabel(condition, id => entityLabel('tag', id)),
      tag: true,
      remove: () => update({ tag_groups: withoutCondition(s.tag_groups, condition) }),
    }))
    for (const range of yearRanges(s.years)) {
      out.push({
        key: `year:${range.from}`,
        label: rangeText(range),
        remove: () =>
          update({ years: s.years.filter(year => year < range.from || year > range.to) }),
      })
    }
    for (const code of s.platforms) {
      out.push({
        key: `platform:${code}`,
        label: platformLabel(code),
        remove: () => update({ platforms: s.platforms.filter(item => item !== code) }),
      })
    }
    for (const code of s.origin_lang) {
      out.push({
        key: `lang:${code}`,
        label: langLabel(code),
        remove: () => update({ origin_lang: s.origin_lang.filter(item => item !== code) }),
      })
    }
    for (const id of s.producer_ids) {
      out.push({
        key: `producer:${id}`,
        label: entityLabel('producer', id),
        remove: () => update({ producer_ids: s.producer_ids.filter(item => item !== id) }),
      })
    }
    for (const id of s.staff_person_ids) {
      out.push({
        key: `staff:${id}`,
        label: entityLabel('staff', id),
        remove: () => update({ staff_person_ids: s.staff_person_ids.filter(item => item !== id) }),
      })
    }
    if (s.include_dev) {
      out.push({
        key: 'dev',
        label: '包含开发中与已中止',
        remove: () => update({ include_dev: false }),
      })
    }
    return out
  })

  const hidden: Partial<GalgameBrowseState> = {
    platforms: [],
    origin_lang: [],
    producer_ids: [],
    staff_person_ids: [],
    staff_role: undefined,
    include_dev: false,
  }

  function clearMore() {
    update(hidden)
  }

  function clear() {
    update({ ...hidden, years: [], tag_groups: [] })
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
export const BROWSE_FILTER_KEY: InjectionKey<BrowseFilter> = Symbol('galgame-browse-filter')

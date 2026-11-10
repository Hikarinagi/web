import type { InjectionKey } from 'vue'
import type { BrowseChip, BrowseFilterRecall } from '~/features/browse/filter'
import { tagConditionLabel, tagConditions, withoutCondition } from '~/features/browse/tag-groups'
import { rangeText, yearRanges } from '~/features/browse/years'
import { statusText, type LightNovelBrowseState } from './explore'

export function useBrowseFilter(
  state: () => LightNovelBrowseState,
  update: (next: Partial<LightNovelBrowseState>) => void,
) {
  const labels = reactive(new Map<string, string>())

  function remember(kind: string, entities: { id: number; name: string }[]) {
    for (const entity of entities) labels.set(`${kind}:${entity.id}`, entity.name)
  }

  function entityLabel(kind: string, id: number): string {
    return labels.get(`${kind}:${id}`) ?? `#${id}`
  }

  const more = computed(() => (state().novel_status ? 1 : 0) + (state().bunko_id ? 1 : 0))

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
    if (s.readable)
      out.push({
        key: 'readable',
        label: '可在站内阅读',
        remove: () => update({ readable: false }),
      })
    if (s.novel_status)
      out.push({
        key: 'status',
        label: statusText(s.novel_status),
        remove: () => update({ novel_status: undefined }),
      })
    if (s.bunko_id) {
      const id = s.bunko_id
      out.push({
        key: `bunko:${id}`,
        label: entityLabel('bunko', id),
        remove: () => update({ bunko_id: undefined }),
      })
    }
    return out
  })

  function clearMore() {
    update({ novel_status: undefined, bunko_id: undefined })
  }

  function clear() {
    update({
      novel_status: undefined,
      bunko_id: undefined,
      readable: false,
      years: [],
      tag_groups: [],
    })
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
export const BROWSE_FILTER_KEY: InjectionKey<BrowseFilter> = Symbol('light-novel-browse-filter')

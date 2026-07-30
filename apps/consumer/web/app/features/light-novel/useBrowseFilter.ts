import type { InjectionKey } from 'vue'
import type { LightNovelBrowseState, TagFilterGroup } from './explore'

type EntityKind = 'tag' | 'bunko'

export interface BrowseChip {
  key: string
  label: string
  remove: () => void
}

export function useBrowseFilter(
  state: () => LightNovelBrowseState,
  update: (next: Partial<LightNovelBrowseState>) => void,
) {
  const labels = reactive(new Map<string, string>())

  function remember(kind: EntityKind, entities: { id: number; name: string }[]) {
    for (const entity of entities) labels.set(`${kind}:${entity.id}`, entity.name)
  }

  function entityLabel(kind: EntityKind, id: number): string {
    return labels.get(`${kind}:${id}`) ?? `#${id}`
  }

  const chips = computed<BrowseChip[]>(() =>
    state().tag_groups.map((group, index) => ({
      key: `tag-group:${index}`,
      label: tagGroupLabel(group, id => entityLabel('tag', id)),
      remove: () => update({ tag_groups: state().tag_groups.filter((_, i) => i !== index) }),
    })),
  )

  function clear() {
    update({ tag_groups: [] })
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
export const BROWSE_FILTER_KEY: InjectionKey<BrowseFilter> = Symbol('light-novel-browse-filter')

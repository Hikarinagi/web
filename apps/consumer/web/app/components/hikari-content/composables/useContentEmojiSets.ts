import type { components } from '@hikarinagi/api-contract/v3'
import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'

type Schemas = components['schemas']

export type EmojiSetDisplay = Schemas['EmojiSetDisplayResDto']
export type EmojiSetCatalog = Schemas['EmojiSetCatalogResDto']
export type EmojiRes = Schemas['EmojiResDto']

export interface EmojiCatalogEntry {
  id: number
  name: string
  src: EmojiRes['src']
  set_id: number
  set_name: string
  set_subscribable: boolean
}

export interface ContentEmojiIndex {
  byComposite: Record<string, EmojiCatalogEntry>
}

const EMPTY_INDEX: ContentEmojiIndex = { byComposite: {} }

export const HIKARI_CONTENT_EMOJI_KEY: InjectionKey<ComputedRef<ContentEmojiIndex>> = Symbol(
  'hikari-content-emoji-sets',
)

export function provideContentEmojiSets(source: () => ContentEmojiIndex | null | undefined): void {
  const indexed = computed<ContentEmojiIndex>(() => source() ?? EMPTY_INDEX)
  provide(HIKARI_CONTENT_EMOJI_KEY, indexed)
}

export function useContentEmojiSets(): ComputedRef<ContentEmojiIndex> {
  const injected = inject(HIKARI_CONTENT_EMOJI_KEY, null)
  if (injected) return injected
  return computed(() => EMPTY_INDEX)
}

export function buildIndexFromSets(sets: EmojiSetDisplay[]): ContentEmojiIndex {
  const byComposite: Record<string, EmojiCatalogEntry> = {}
  for (const set of sets) {
    for (const emoji of set.emojis) {
      byComposite[`${set.name}:${emoji.name}`] = {
        id: emoji.id,
        name: emoji.name,
        src: emoji.src,
        set_id: set.id,
        set_name: set.name,
        set_subscribable: set.subscribable,
      }
    }
  }
  return { byComposite }
}

export function buildContentEmojiIndex(opts: {
  documentSets?: EmojiSetDisplay[]
  userCatalogSets?: EmojiSetCatalog[]
}): ContentEmojiIndex {
  const byComposite: Record<string, EmojiCatalogEntry> = {}
  for (const set of opts.userCatalogSets ?? []) {
    for (const emoji of set.emojis) {
      byComposite[`${set.name}:${emoji.name}`] = {
        id: emoji.id,
        name: emoji.name,
        src: emoji.src,
        set_id: set.id,
        set_name: set.name,
        set_subscribable: false,
      }
    }
  }
  for (const set of opts.documentSets ?? []) {
    for (const emoji of set.emojis) {
      byComposite[`${set.name}:${emoji.name}`] = {
        id: emoji.id,
        name: emoji.name,
        src: emoji.src,
        set_id: set.id,
        set_name: set.name,
        set_subscribable: set.subscribable,
      }
    }
  }
  return { byComposite }
}

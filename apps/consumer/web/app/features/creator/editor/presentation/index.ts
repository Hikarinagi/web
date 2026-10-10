import { characterPresentation } from './character'
import { galgamePresentation } from './galgame'
import { lightNovelPresentation } from './light-novel'
import { lightNovelVolumePresentation } from './light-novel-volume'
import { mangaPresentation } from './manga'
import { mangaVolumePresentation } from './manga-volume'
import { personPresentation } from './person'
import { producerPresentation } from './producer'
import { tagPresentation } from './tag'
import type { EditorPresentation } from './types'

export const EDITOR_PRESENTATIONS: Record<string, EditorPresentation> = {
  galgame: galgamePresentation,
  'light-novel': lightNovelPresentation,
  'light-novel-volume': lightNovelVolumePresentation,
  manga: mangaPresentation,
  'manga-volume': mangaVolumePresentation,
  person: personPresentation,
  producer: producerPresentation,
  character: characterPresentation,
  tag: tagPresentation,
}

export type { EditorFieldPresentation, EditorPresentation } from './types'

export function sortFields<T extends { field: string }>(
  fields: readonly T[],
  presentation: Record<string, unknown>,
): T[] {
  const order = Object.keys(presentation)
  const rank = (name: string) => {
    const index = order.indexOf(name)
    return index === -1 ? Number.MAX_SAFE_INTEGER : index
  }
  return [...fields].sort((a, b) => rank(a.field) - rank(b.field))
}

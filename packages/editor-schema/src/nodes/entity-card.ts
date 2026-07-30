import { Node, mergeAttributes } from '@tiptap/core'
import {
  ENTITY_CARD_SPECS,
  entityCardDataAttr,
  type EntityCardIdKey,
  type EntityCardNodeType,
  type EntityCardSpec,
} from '../render-protocol.js'

function createEntityCardNode(spec: EntityCardSpec) {
  const dataIdAttr = entityCardDataAttr(spec.idKey)
  return Node.create({
    name: spec.nodeName,
    group: 'block',
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
      return {
        [spec.idKey]: { default: null },
      }
    },

    parseHTML() {
      return [{ tag: `aside[data-card-type="${spec.dataCardType}"]` }]
    },

    renderHTML({ node }) {
      const id = node.attrs[spec.idKey] as number | null
      return [
        'aside',
        mergeAttributes({
          class: 'hikari-content-entity-card',
          'data-card-type': spec.dataCardType,
          [dataIdAttr]: String(id ?? ''),
        }),
      ]
    },
  })
}

type EntityCardExtension = ReturnType<typeof createEntityCardNode>

const EXTENSIONS_BY_NAME = Object.fromEntries(
  ENTITY_CARD_SPECS.map(spec => [spec.nodeName, createEntityCardNode(spec)]),
) as Record<EntityCardNodeType, EntityCardExtension>

export const ENTITY_CARD_EXTENSIONS: readonly EntityCardExtension[] = ENTITY_CARD_SPECS.map(
  spec => EXTENSIONS_BY_NAME[spec.nodeName],
)

export const ENTITY_CARD_NODE_TYPES: ReadonlySet<EntityCardNodeType> = new Set(
  ENTITY_CARD_SPECS.map(spec => spec.nodeName),
)

export const ENTITY_CARD_ID_KEY = Object.fromEntries(
  ENTITY_CARD_SPECS.map(spec => [spec.nodeName, spec.idKey]),
) as Record<EntityCardNodeType, EntityCardIdKey>

export const GalgameCardExtension = EXTENSIONS_BY_NAME.galgame_card
export const LightNovelCardExtension = EXTENSIONS_BY_NAME.light_novel_card
export const LightNovelVolumeCardExtension = EXTENSIONS_BY_NAME.light_novel_volume_card
export const MangaCardExtension = EXTENSIONS_BY_NAME.manga_card
export const PersonCardExtension = EXTENSIONS_BY_NAME.person_card
export const ProducerCardExtension = EXTENSIONS_BY_NAME.producer_card
export const CharacterCardExtension = EXTENSIONS_BY_NAME.character_card
export const ArticleCardExtension = EXTENSIONS_BY_NAME.article_card
export const PostCardExtension = EXTENSIONS_BY_NAME.post_card
export const GalgameRateCardExtension = EXTENSIONS_BY_NAME.galgame_rate_card
export const LightNovelRateCardExtension = EXTENSIONS_BY_NAME.light_novel_rate_card
export const MangaRateCardExtension = EXTENSIONS_BY_NAME.manga_rate_card
export const CommentCardExtension = EXTENSIONS_BY_NAME.comment_card

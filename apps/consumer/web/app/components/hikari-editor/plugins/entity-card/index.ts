import { Boxes } from '@lucide/vue'
import {
  ArticleCardExtension,
  CharacterCardExtension,
  GalgameCardExtension,
  GalgameRateCardExtension,
  LightNovelCardExtension,
  LightNovelRateCardExtension,
  LightNovelVolumeCardExtension,
  MangaCardExtension,
  MangaRateCardExtension,
  PersonCardExtension,
  PostCardExtension,
  ProducerCardExtension,
} from '@hikarinagi/editor-schema'
import { VueNodeViewRenderer } from '@tiptap/vue-3'
import type { EditorPlugin, ToolbarDropdownItem } from '../types'
import EntityCardEditorView from './EntityCardEditorView.vue'
import EntityCardSearch from './EntityCardSearch.vue'
import { ENTITY_CARD_META } from './labels'
import { ENTITY_CARD_TYPES, type EntityCardType } from './types'

const NODE_VIEW = {
  addNodeView() {
    return VueNodeViewRenderer(EntityCardEditorView)
  },
}

const ENTITY_CARD_EXTENSIONS = [
  GalgameCardExtension.extend(NODE_VIEW),
  LightNovelCardExtension.extend(NODE_VIEW),
  LightNovelVolumeCardExtension.extend(NODE_VIEW),
  MangaCardExtension.extend(NODE_VIEW),
  PersonCardExtension.extend(NODE_VIEW),
  ProducerCardExtension.extend(NODE_VIEW),
  CharacterCardExtension.extend(NODE_VIEW),
  ArticleCardExtension.extend(NODE_VIEW),
  PostCardExtension.extend(NODE_VIEW),
  GalgameRateCardExtension.extend(NODE_VIEW),
  LightNovelRateCardExtension.extend(NODE_VIEW),
  MangaRateCardExtension.extend(NODE_VIEW),
]

const dropdownItems: ToolbarDropdownItem[] = ENTITY_CARD_TYPES.map(type => ({
  id: type,
  icon: ENTITY_CARD_META[type].icon,
  label: ENTITY_CARD_META[type].label,
  onClick: (editor, ctx, trigger) => {
    ctx.openOverlay('entity-card', trigger, {
      editor,
      entityType: type as EntityCardType,
      summariesRef: ctx.summariesRef,
    })
  },
}))

export const entityCard: EditorPlugin = {
  id: 'entity-card',
  group: 'insert-media',
  order: 1,
  extensions: () => ENTITY_CARD_EXTENSIONS,
  toolbarItem: {
    icon: Boxes,
    tooltip: '插入实体卡片',
    variant: 'dropdown',
    dropdownItems,
  },
  overlays: {
    'entity-card': EntityCardSearch,
  },
}

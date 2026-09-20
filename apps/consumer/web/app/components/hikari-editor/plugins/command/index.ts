import {
  AtSign,
  Baseline,
  Braces,
  Heading2,
  Heading3,
  Heading4,
  Image as ImageIcon,
  Link2,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Quote,
  Smile,
  Table,
  Vote,
} from '@lucide/vue'
import { Extension, type Range } from '@tiptap/core'
import { Plugin, PluginKey, type EditorState } from '@tiptap/pm/state'
import { useMediaLibrary } from '~/components/media-library/composables/useMediaLibrary'
import { pickInitialWidthPercent } from '../image/composables/useImageResize'
import { insertHorizontalRule } from '../horizontal-rule'
import { getSelectionAnchor, readLinkContext } from '../link/helpers'
import type { EditorPlugin, EditorPluginContext } from '../types'
import { ENTITY_CARD_META } from '../entity-card/labels'
import { ENTITY_CARD_TYPES, type EntityCardType } from '../entity-card/types'
import { openPollInsert } from '../poll'
import { insertTable } from '../table'
import { insertAfterTable } from '../table/insert'
import { createCommandMenuRenderer, type CommandMenuState } from './composables/useCommandMenu'
import type { CommandActionContext, CommandMenuItem } from './types'

const MAX_COMMAND_ITEMS = 32

const ENTITY_CARD_COMMANDS: Record<EntityCardType, string> = {
  galgame: '/galgame',
  light_novel: '/ln',
  light_novel_volume: '/lnv',
  manga: '/manga',
  person: '/person',
  producer: '/producer',
  character: '/character',
  article: '/article',
  post: '/post',
  galgame_rate: '/galgame-rate',
  light_novel_rate: '/ln-rate',
  manga_rate: '/manga-rate',
}

const ENTITY_CARD_KEYWORDS: Record<EntityCardType, readonly string[]> = {
  galgame: ['game', 'gal', '游戏', '作品'],
  light_novel: ['light novel', 'novel', 'lnovel', '轻小说', '小说'],
  light_novel_volume: ['light novel volume', 'volume', 'lnvolume', '轻小说卷', '分卷'],
  manga: ['manga', 'comic', '漫画'],
  person: ['people', 'staff', '人物', '作者', '声优'],
  producer: ['company', 'brand', 'studio', '开发商', '制作组', '会社'],
  character: ['char', 'role', '角色'],
  article: ['news', '文章', '专栏'],
  post: ['community', 'thread', '帖子', '图文', '动态'],
  galgame_rate: ['rate', 'score', '评分', '打分', '我的评分', 'gal 评分'],
  light_novel_rate: ['rate', 'score', '评分', '打分', '我的评分', 'ln 评分'],
  manga_rate: ['rate', 'score', '评分', '打分', '我的评分', '漫画评分'],
}

function normalize(value: string): string {
  return value.trim().toLowerCase()
}

function insertParagraph(ctx: CommandActionContext) {
  ctx.editor.chain().focus().deleteRange(ctx.range).setParagraph().run()
}

function setHeading(ctx: CommandActionContext, level: 2 | 3 | 4) {
  ctx.editor.chain().focus().deleteRange(ctx.range).setNode('heading', { level }).run()
}

function openOverlay(ctx: CommandActionContext, id: string, props: Record<string, unknown>) {
  ctx.editor.chain().focus().deleteRange(ctx.range).run()
  ctx.pluginContext.openOverlay(id, getSelectionAnchor(ctx.editor), props)
}

async function insertImage(ctx: CommandActionContext) {
  ctx.editor.chain().focus().deleteRange(ctx.range).run()
  const picks = await useMediaLibrary().open({ mode: 'single' })
  const media = picks[0]
  if (!media) return

  const surfaceWidth = (ctx.editor.view.dom as HTMLElement).clientWidth || 0
  const widthPercent = pickInitialWidthPercent(media.width ?? 0, surfaceWidth)
  const content = [
    {
      type: 'image_block',
      attrs: {
        media_asset_id: media.id,
        src: media.src,
        alt: null,
        caption: null,
        width: media.width ?? 0,
        height: media.height ?? 0,
        width_percent: widthPercent,
      },
    },
    { type: 'paragraph' },
  ]
  if (insertAfterTable(ctx.editor, content)) return
  ctx.editor.chain().focus().insertContent(content).run()
}

function openEntityCard(ctx: CommandActionContext, entityType: EntityCardType) {
  openOverlay(ctx, 'entity-card', {
    editor: ctx.editor,
    entityType,
    summariesRef: ctx.pluginContext.summariesRef,
  })
}

function createCommandItems(): CommandMenuItem[] {
  const entityItems: CommandMenuItem[] = ENTITY_CARD_TYPES.map(entityType => ({
    id: `entity-${entityType}`,
    icon: ENTITY_CARD_META[entityType].icon,
    command: ENTITY_CARD_COMMANDS[entityType],
    label: `${ENTITY_CARD_META[entityType].label} 卡片`,
    description: `搜索并插入${ENTITY_CARD_META[entityType].label}`,
    keywords: [
      'card',
      'entity',
      '关联',
      '卡片',
      entityType.replaceAll('_', ' '),
      ENTITY_CARD_META[entityType].label,
      ...ENTITY_CARD_KEYWORDS[entityType],
    ],
    action: ctx => openEntityCard(ctx, entityType),
  }))

  return [
    {
      id: 'paragraph',
      icon: Pilcrow,
      command: '/p',
      label: '正文',
      description: '转为普通段落',
      keywords: ['p', 'paragraph', '正文', '段落'],
      action: insertParagraph,
    },
    {
      id: 'heading-2',
      icon: Heading2,
      command: '/h2',
      label: '标题 H2',
      description: '大段落标题',
      keywords: ['h2', 'heading', 'title', '标题'],
      action: ctx => setHeading(ctx, 2),
    },
    {
      id: 'heading-3',
      icon: Heading3,
      command: '/h3',
      label: '标题 H3',
      description: '小节标题',
      keywords: ['h3', 'heading', 'subtitle', '标题'],
      action: ctx => setHeading(ctx, 3),
    },
    {
      id: 'heading-4',
      icon: Heading4,
      command: '/h4',
      label: '标题 H4',
      description: '更小的标题',
      keywords: ['h4', 'heading', '标题'],
      action: ctx => setHeading(ctx, 4),
    },
    {
      id: 'bullet-list',
      icon: List,
      command: '/ul',
      label: '无序列表',
      description: '创建项目符号列表',
      keywords: ['ul', 'list', 'bullet', '列表', '无序'],
      action: ctx => ctx.editor.chain().focus().deleteRange(ctx.range).toggleBulletList().run(),
    },
    {
      id: 'ordered-list',
      icon: ListOrdered,
      command: '/ol',
      label: '有序列表',
      description: '创建编号列表',
      keywords: ['ol', 'list', 'ordered', 'number', '列表', '有序', '编号'],
      action: ctx => ctx.editor.chain().focus().deleteRange(ctx.range).toggleOrderedList().run(),
    },
    {
      id: 'blockquote',
      icon: Quote,
      command: '/quote',
      label: '引用块',
      description: '引用一段内容',
      keywords: ['quote', 'blockquote', '引用'],
      action: ctx => ctx.editor.chain().focus().deleteRange(ctx.range).toggleBlockquote().run(),
    },
    {
      id: 'code-block',
      icon: Braces,
      command: '/code',
      label: '代码块',
      description: '插入多行代码',
      keywords: ['code', 'pre', '代码'],
      action: ctx => ctx.editor.chain().focus().deleteRange(ctx.range).toggleCodeBlock().run(),
    },
    {
      id: 'horizontal-rule',
      icon: Minus,
      command: '/hr',
      label: '分隔线',
      description: '插入内容分隔线',
      keywords: ['hr', 'rule', 'divider', '分割', '分隔线'],
      action: ctx => {
        ctx.editor.chain().focus().deleteRange(ctx.range).run()
        insertHorizontalRule(ctx.editor)
      },
    },
    {
      id: 'image',
      icon: ImageIcon,
      command: '/image',
      label: '图片',
      description: '从媒体库插入图片',
      keywords: ['image', 'media', 'photo', '图片', '媒体'],
      action: insertImage,
    },
    {
      id: 'link',
      icon: Link2,
      command: '/link',
      label: '链接',
      description: '插入或编辑链接',
      keywords: ['link', 'url', 'href', '链接'],
      action: ctx =>
        openOverlay(ctx, 'link', {
          editor: ctx.editor,
          ...readLinkContext(ctx.editor),
        }),
    },
    {
      id: 'emoji',
      icon: Smile,
      command: '/emoji',
      label: '贴纸',
      description: '打开贴纸选择器',
      keywords: ['emoji', 'sticker', '表情', '贴纸'],
      action: ctx => openOverlay(ctx, 'emoji-picker', { editor: ctx.editor }),
    },
    {
      id: 'poll',
      icon: Vote,
      command: '/poll',
      label: '投票',
      description: '插入一个社区投票',
      keywords: ['poll', 'vote', '投票', '调查', '问卷'],
      action: ctx => {
        ctx.editor.chain().focus().deleteRange(ctx.range).run()
        openPollInsert(ctx.editor)
      },
    },
    {
      id: 'table',
      icon: Table,
      command: '/table',
      label: '表格',
      description: '插入 3×3 表格',
      keywords: ['table', 'grid', '表格', '数据表'],
      action: ctx => {
        ctx.editor.chain().focus().deleteRange(ctx.range).run()
        insertTable(ctx.editor)
      },
    },
    {
      id: 'mention',
      icon: AtSign,
      command: '/mention',
      label: '提及用户',
      description: '继续输入用户名搜索',
      keywords: ['mention', 'user', '@', '提及', '用户'],
      action: ctx => ctx.editor.chain().focus().insertContentAt(ctx.range, '@').run(),
    },
    {
      id: 'text-color',
      icon: Baseline,
      command: '/color',
      label: '文字颜色',
      description: '打开颜色面板',
      keywords: ['color', 'text', '颜色', '文字'],
      action: ctx => openOverlay(ctx, 'text-color', { editor: ctx.editor }),
    },
    ...entityItems,
  ]
}

function matchScore(item: CommandMenuItem, query: string): number | null {
  const q = normalize(query)
  if (!q) return 0

  const command = normalize(item.command).replace(/^\//, '')
  if (command === q) return 0
  if (command.startsWith(q)) return 1
  if (normalize(item.label).includes(q)) return 2
  if (item.keywords.map(normalize).some(keyword => keyword === q)) return 3
  if (item.keywords.map(normalize).some(keyword => keyword.includes(q))) return 4
  if (normalize(item.description).includes(q)) return 5

  return null
}

function filterItems(items: CommandMenuItem[], query: string): CommandMenuItem[] {
  return items
    .map((item, index) => ({ item, index, score: matchScore(item, query) }))
    .filter((entry): entry is { item: CommandMenuItem; index: number; score: number } => {
      return entry.score !== null
    })
    .sort((a, b) => a.score - b.score || a.index - b.index)
    .map(entry => entry.item)
    .slice(0, MAX_COMMAND_ITEMS)
}

interface CommandMatch {
  range: Range
  query: string
  text: string
}

interface CommandPluginState extends CommandMenuState {
  dismissed: { from: number; text: string } | null
}

interface CommandExtensionOptions {
  pluginContext: EditorPluginContext
  items: CommandMenuItem[]
}

interface CommandPluginMeta {
  dismiss?: boolean
}

const commandPluginKey = new PluginKey<CommandPluginState>('hikariCommand')

function inactive(dismissed: CommandPluginState['dismissed'] = null): CommandPluginState {
  return { active: false, query: '', range: null, items: [], dismissed }
}

function findCommandMatch(state: EditorState): CommandMatch | null {
  const { selection } = state
  if (!selection.empty) return null

  const $from = selection.$from
  if (!$from.parent.isTextblock) return null

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, '\n', '\n')
  const match = /(^|\s)\/([^\s/]*)$/.exec(textBefore)
  if (!match) return null

  const prefix = match[1] ?? ''
  const query = match[2] ?? ''
  const slashOffset = match.index + prefix.length
  const from = $from.start() + slashOffset

  return {
    range: { from, to: $from.pos },
    query,
    text: `/${query}`,
  }
}

function toMenuState(items: CommandMenuItem[], match: CommandMatch): CommandPluginState {
  return {
    active: true,
    query: match.query,
    range: match.range,
    items: filterItems(items, match.query),
    dismissed: null,
  }
}

const CommandExtension = Extension.create<CommandExtensionOptions>({
  name: 'hikari_command',

  addProseMirrorPlugins() {
    const editor = this.editor
    const { items, pluginContext } = this.options
    const rendererRef: { current: ReturnType<typeof createCommandMenuRenderer> | null } = {
      current: null,
    }

    return [
      new Plugin<CommandPluginState>({
        key: commandPluginKey,
        state: {
          init: () => inactive(),
          apply: (tr, value, _oldState, newState) => {
            const meta = tr.getMeta(commandPluginKey) as CommandPluginMeta | undefined
            const match = findCommandMatch(newState)

            if (meta?.dismiss) {
              return inactive(
                match ? { from: match.range.from, text: match.text } : value.dismissed,
              )
            }

            if (!match) return inactive(null)

            if (
              value.dismissed &&
              value.dismissed.from === match.range.from &&
              value.dismissed.text === match.text
            ) {
              return inactive(value.dismissed)
            }

            return toMenuState(items, match)
          },
        },
        props: {
          handleKeyDown(view, event) {
            const state = commandPluginKey.getState(view.state)
            if (!state?.active) return false

            if (event.key === 'Escape') {
              view.dispatch(view.state.tr.setMeta(commandPluginKey, { dismiss: true }))
              return true
            }

            return rendererRef.current?.keydown(event) ?? false
          },
        },
        view: view => {
          rendererRef.current = createCommandMenuRenderer(editor, pluginContext)
          rendererRef.current.update(commandPluginKey.getState(view.state) ?? inactive(), view)

          return {
            update(nextView) {
              rendererRef.current?.update(
                commandPluginKey.getState(nextView.state) ?? inactive(),
                nextView,
              )
            },
            destroy() {
              rendererRef.current?.destroy()
              rendererRef.current = null
            },
          }
        },
      }),
    ]
  },
})

export const command: EditorPlugin = {
  id: 'command',
  group: null,
  order: 0,
  extensions: (pluginContext: EditorPluginContext) => {
    const items = createCommandItems()
    return [
      CommandExtension.configure({
        pluginContext,
        items,
      }),
    ]
  },
}

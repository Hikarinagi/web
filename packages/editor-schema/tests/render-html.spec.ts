/**
 * @jest-environment jsdom
 */
import { generateHTML } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import type { EditorDocument } from '../src/index'
import {
  ArticleCardExtension,
  CharacterCardExtension,
  EmojiInlineExtension,
  GalgameCardExtension,
  GalgameRateCardExtension,
  ImageBlockExtension,
  LightNovelCardExtension,
  LightNovelRateCardExtension,
  LightNovelVolumeCardExtension,
  LinkMark,
  MangaCardExtension,
  MangaRateCardExtension,
  MentionUserExtension,
  PersonCardExtension,
  PostCardExtension,
  ProducerCardExtension,
} from '../src/index'

const extensions = [
  StarterKit.configure({ link: false }),
  LinkMark,
  ImageBlockExtension,
  MentionUserExtension,
  EmojiInlineExtension,
  GalgameCardExtension,
  LightNovelCardExtension,
  LightNovelVolumeCardExtension,
  MangaCardExtension,
  PersonCardExtension,
  ProducerCardExtension,
  CharacterCardExtension,
  ArticleCardExtension,
  PostCardExtension,
  GalgameRateCardExtension,
  LightNovelRateCardExtension,
  MangaRateCardExtension,
]

function render(doc: EditorDocument): string {
  return generateHTML(doc as Parameters<typeof generateHTML>[0], extensions)
}

describe('schema renderHTML contract', () => {
  it('prose block nodes (paragraph / heading / list / blockquote / codeBlock / hr / hardBreak)', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: 'H2 标题' }] },
        { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: 'H3 标题' }] },
        { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: 'H4 标题' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '段落一行' },
            { type: 'hardBreak' },
            { type: 'text', text: '换行后' },
          ],
        },
        {
          type: 'bulletList',
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item 1' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'item 2' }] }],
            },
          ],
        },
        {
          type: 'orderedList',
          attrs: { start: 1 },
          content: [
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }],
            },
            {
              type: 'listItem',
              content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }],
            },
          ],
        },
        {
          type: 'blockquote',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '引用一段' }] }],
        },
        {
          type: 'codeBlock',
          attrs: { language: 'ts' },
          content: [{ type: 'text', text: 'const x: number = 1' }],
        },
        { type: 'horizontalRule' },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })

  it('marks (bold / italic / strike / code / link)', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'plain ' },
            { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'strike', marks: [{ type: 'strike' }] },
            { type: 'text', text: ' ' },
            { type: 'text', text: 'code', marks: [{ type: 'code' }] },
            { type: 'text', text: ' ' },
            {
              type: 'text',
              text: 'external link',
              marks: [{ type: 'link', attrs: { href: 'https://hikarinagi.com/help' } }],
            },
            { type: 'text', text: ' ' },
            {
              type: 'text',
              text: 'internal link',
              marks: [{ type: 'link', attrs: { href: '/galgames/123' } }],
            },
            { type: 'text', text: ' ' },
            {
              type: 'text',
              text: 'bold italic',
              marks: [{ type: 'bold' }, { type: 'italic' }],
            },
          ],
        },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })

  it('image_block (with caption + width/height + width_percent)', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'image_block',
          attrs: {
            media_asset_id: 42,
            src: 'media/img/sample.webp',
            alt: '示例图',
            caption: '图注说明',
            width: 1280,
            height: 720,
            width_percent: 75,
          },
        },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })

  it('mention_user / emoji_inline (inline atoms)', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'hello ' },
            { type: 'mention_user', attrs: { mention_user_id: 7 } },
            { type: 'text', text: ' 看看 ' },
            { type: 'emoji_inline', attrs: { emoji_code: 'classic:smile' } },
          ],
        },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })

  it('entity card 11 类全部 renderHTML 稳定', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        { type: 'galgame_card', attrs: { galgame_id: 1 } },
        { type: 'light_novel_card', attrs: { light_novel_id: 2 } },
        { type: 'light_novel_volume_card', attrs: { light_novel_volume_id: 3 } },
        { type: 'person_card', attrs: { person_id: 4 } },
        { type: 'producer_card', attrs: { producer_id: 5 } },
        { type: 'character_card', attrs: { character_id: 6 } },
        { type: 'article_card', attrs: { article_id: 7 } },
        { type: 'post_card', attrs: { post_id: 8 } },
        { type: 'galgame_rate_card', attrs: { galgame_rate_id: 9 } },
        { type: 'light_novel_rate_card', attrs: { light_novel_rate_id: 10 } },
        { type: 'manga_card', attrs: { manga_id: 12 } },
        { type: 'manga_rate_card', attrs: { manga_rate_id: 11 } },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })

  it('综合文档:嵌套 + 多 mark + atoms 混排', () => {
    const doc: EditorDocument = {
      type: 'doc',
      content: [
        { type: 'heading', attrs: { level: 2 }, content: [{ type: 'text', text: '综合测试' }] },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: '正文 ' },
            { type: 'text', text: '加粗', marks: [{ type: 'bold' }] },
            { type: 'text', text: ' 与 ' },
            { type: 'mention_user', attrs: { mention_user_id: 11 } },
            { type: 'text', text: ' 提及。' },
          ],
        },
        {
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '引用内嵌 ' },
                { type: 'emoji_inline', attrs: { emoji_code: 'classic:fire' } },
                { type: 'text', text: ' 表情' },
              ],
            },
          ],
        },
        { type: 'galgame_card', attrs: { galgame_id: 99 } },
        {
          type: 'image_block',
          attrs: {
            media_asset_id: 1,
            src: 'media/cover.webp',
            alt: null,
            caption: null,
            width: 1200,
            height: 800,
            width_percent: 100,
          },
        },
      ],
    }
    expect(render(doc)).toMatchSnapshot()
  })
})

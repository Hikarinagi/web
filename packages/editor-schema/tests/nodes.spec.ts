import {
  ArticleCardExtension,
  CharacterCardExtension,
  CommentCardExtension,
  ENTITY_CARD_EXTENSIONS,
  ENTITY_CARD_ID_KEY,
  ENTITY_CARD_NODE_TYPES,
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

describe('custom nodes/marks', () => {
  it('image_block 是 block atom 并使用 typed FK media_asset_id', () => {
    expect(ImageBlockExtension.name).toBe('image_block')
    expect(ImageBlockExtension.config.group).toBe('block')
    expect(ImageBlockExtension.config.atom).toBe(true)
  })

  it('mention_user / emoji_inline 是 inline atom', () => {
    expect(MentionUserExtension.name).toBe('mention_user')
    expect(MentionUserExtension.config.inline).toBe(true)
    expect(MentionUserExtension.config.atom).toBe(true)
    expect(EmojiInlineExtension.name).toBe('emoji_inline')
    expect(EmojiInlineExtension.config.inline).toBe(true)
    expect(EmojiInlineExtension.config.atom).toBe(true)
  })

  it('13 种 entity card 都是 block atom 且名称匹配', () => {
    expect(ENTITY_CARD_EXTENSIONS).toHaveLength(13)
    expect(GalgameCardExtension.name).toBe('galgame_card')
    expect(LightNovelCardExtension.name).toBe('light_novel_card')
    expect(LightNovelVolumeCardExtension.name).toBe('light_novel_volume_card')
    expect(MangaCardExtension.name).toBe('manga_card')
    expect(PersonCardExtension.name).toBe('person_card')
    expect(ProducerCardExtension.name).toBe('producer_card')
    expect(CharacterCardExtension.name).toBe('character_card')
    expect(ArticleCardExtension.name).toBe('article_card')
    expect(PostCardExtension.name).toBe('post_card')
    expect(GalgameRateCardExtension.name).toBe('galgame_rate_card')
    expect(LightNovelRateCardExtension.name).toBe('light_novel_rate_card')
    expect(MangaRateCardExtension.name).toBe('manga_rate_card')
    expect(CommentCardExtension.name).toBe('comment_card')
    for (const ext of ENTITY_CARD_EXTENSIONS) {
      expect(ext.config.group).toBe('block')
      expect(ext.config.atom).toBe(true)
    }
  })

  it('ENTITY_CARD_NODE_TYPES 与 ENTITY_CARD_ID_KEY 形态对得上 typed FK', () => {
    expect(ENTITY_CARD_NODE_TYPES.size).toBe(13)
    expect(ENTITY_CARD_ID_KEY.galgame_card).toBe('galgame_id')
    expect(ENTITY_CARD_ID_KEY.light_novel_card).toBe('light_novel_id')
    expect(ENTITY_CARD_ID_KEY.light_novel_volume_card).toBe('light_novel_volume_id')
    expect(ENTITY_CARD_ID_KEY.manga_card).toBe('manga_id')
    expect(ENTITY_CARD_ID_KEY.person_card).toBe('person_id')
    expect(ENTITY_CARD_ID_KEY.producer_card).toBe('producer_id')
    expect(ENTITY_CARD_ID_KEY.character_card).toBe('character_id')
    expect(ENTITY_CARD_ID_KEY.article_card).toBe('article_id')
    expect(ENTITY_CARD_ID_KEY.post_card).toBe('post_id')
    expect(ENTITY_CARD_ID_KEY.galgame_rate_card).toBe('galgame_rate_id')
    expect(ENTITY_CARD_ID_KEY.light_novel_rate_card).toBe('light_novel_rate_id')
    expect(ENTITY_CARD_ID_KEY.manga_rate_card).toBe('manga_rate_id')
    expect(ENTITY_CARD_ID_KEY.comment_card).toBe('comment_id')
  })

  it('LinkMark 关闭 autolink 并限制 https 协议', () => {
    const options = LinkMark.options as { autolink: boolean; protocols: string[] }
    expect(options.autolink).toBe(false)
    expect(options.protocols).toEqual(['https'])
  })
})

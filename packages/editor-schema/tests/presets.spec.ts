import { ARTICLE_PRESET, COMMENT_PRESET, POST_PRESET } from '../src/index'

describe('presets', () => {
  it('ARTICLE_PRESET 包含 10 种 entity card 与基础 node/mark', () => {
    const types = ARTICLE_PRESET.allowed_node_types
    expect(types.has('paragraph')).toBe(true)
    expect(types.has('heading')).toBe(true)
    expect(types.has('image_block')).toBe(true)
    expect(types.has('galgame_card')).toBe(true)
    expect(types.has('light_novel_card')).toBe(true)
    expect(types.has('light_novel_volume_card')).toBe(true)
    expect(types.has('manga_card')).toBe(true)
    expect(types.has('person_card')).toBe(true)
    expect(types.has('producer_card')).toBe(true)
    expect(types.has('character_card')).toBe(true)
    expect(types.has('article_card')).toBe(true)
    expect(types.has('post_card')).toBe(true)
    expect(types.has('galgame_rate_card')).toBe(true)
    expect(types.has('light_novel_rate_card')).toBe(true)
    expect(types.has('manga_rate_card')).toBe(true)
    expect(ARTICLE_PRESET.allowed_mark_types.has('link')).toBe(true)
    expect(ARTICLE_PRESET.allowed_mark_types.has('bold')).toBe(true)
  })

  it('POST_PRESET 的限额比 ARTICLE_PRESET 小', () => {
    expect(POST_PRESET.limits.max_json_bytes).toBeLessThan(ARTICLE_PRESET.limits.max_json_bytes)
    expect(POST_PRESET.limits.max_image_nodes).toBeLessThan(ARTICLE_PRESET.limits.max_image_nodes)
    expect(POST_PRESET.limits.max_entity_card_nodes).toBeLessThan(
      ARTICLE_PRESET.limits.max_entity_card_nodes,
    )
  })

  it('COMMENT_PRESET 允许基础 node 与四种 work card, 不允许其它 card / block', () => {
    const types = COMMENT_PRESET.allowed_node_types
    expect(types.has('paragraph')).toBe(true)
    expect(types.has('text')).toBe(true)
    expect(types.has('hard_break')).toBe(true)
    expect(types.has('mention_user')).toBe(true)
    expect(types.has('emoji_inline')).toBe(true)
    expect(types.has('galgame_card')).toBe(true)
    expect(types.has('light_novel_card')).toBe(true)
    expect(types.has('light_novel_volume_card')).toBe(true)
    expect(types.has('manga_card')).toBe(true)
    expect(types.has('heading')).toBe(false)
    expect(types.has('bullet_list')).toBe(false)
    expect(types.has('image_block')).toBe(false)
    expect(types.has('person_card')).toBe(false)
    expect(types.has('galgame_rate_card')).toBe(false)
  })

  it('COMMENT_PRESET 只允许 link mark', () => {
    expect(COMMENT_PRESET.allowed_mark_types.has('link')).toBe(true)
    expect(COMMENT_PRESET.allowed_mark_types.has('bold')).toBe(false)
    expect(COMMENT_PRESET.allowed_mark_types.has('italic')).toBe(false)
    expect(COMMENT_PRESET.allowed_mark_types.has('code')).toBe(false)
  })

  it('css_scope_class 跟随 preset key', () => {
    expect(ARTICLE_PRESET.css_scope_class).toBe('hikari-content--article')
    expect(POST_PRESET.css_scope_class).toBe('hikari-content--post')
    expect(COMMENT_PRESET.css_scope_class).toBe('hikari-content--comment')
  })

  it('COMMENT_PRESET 限制 work card 上限为 5, image / embed 仍为 0', () => {
    expect(COMMENT_PRESET.limits.max_entity_card_nodes).toBe(5)
    expect(COMMENT_PRESET.limits.max_image_nodes).toBe(0)
    expect(COMMENT_PRESET.limits.max_embed_nodes).toBe(0)
  })
})

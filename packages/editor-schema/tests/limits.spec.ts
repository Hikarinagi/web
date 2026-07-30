import { ARTICLE_PRESET, COMMENT_PRESET, validateDocument } from '../src/index'

function doc(content: object[]): object {
  return { type: 'doc', content }
}
function p(...children: object[]): object {
  return { type: 'paragraph', content: children }
}
function text(t: string): object {
  return { type: 'text', text: t }
}

describe('limits: 各项越界检测', () => {
  it('comment 超出 plain_text_chars 被拒', () => {
    const big = 'a'.repeat(COMMENT_PRESET.limits.max_plain_text_chars + 1)
    const r = validateDocument(doc([p(text(big))]), COMMENT_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_plain_text_chars')).toBe(true)
  })

  it('comment 中放入超过 max_mention_user_nodes 的 mention 被拒', () => {
    const mentions: object[] = []
    for (let i = 0; i < COMMENT_PRESET.limits.max_mention_user_nodes + 1; i++) {
      mentions.push({ type: 'mention_user', attrs: { mention_user_id: i + 1 } })
    }
    const r = validateDocument(doc([p(...mentions)]), COMMENT_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_mention_user_nodes')).toBe(true)
  })

  it('article 中超过 max_image_nodes 被拒', () => {
    const imgs: object[] = []
    for (let i = 0; i < ARTICLE_PRESET.limits.max_image_nodes + 1; i++) {
      imgs.push({
        type: 'image_block',
        attrs: {
          media_asset_id: i + 1,
          src: `k/${i}`,
          alt: null,
          caption: null,
          width: 100,
          height: 100,
        },
      })
    }
    const r = validateDocument(doc(imgs), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_image_nodes')).toBe(true)
  })

  it('article 中超过 max_entity_card_nodes 被拒', () => {
    const cards: object[] = []
    for (let i = 0; i < ARTICLE_PRESET.limits.max_entity_card_nodes + 1; i++) {
      cards.push({ type: 'galgame_card', attrs: { galgame_id: i + 1 } })
    }
    const r = validateDocument(doc(cards), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_entity_card_nodes')).toBe(true)
  })

  it('entity card 计数跨多种 *_card 累计', () => {
    const cards: object[] = []
    const limit = ARTICLE_PRESET.limits.max_entity_card_nodes
    const half = Math.ceil(limit / 2) + 1
    for (let i = 0; i < half; i++) {
      cards.push({ type: 'galgame_card', attrs: { galgame_id: i + 1 } })
    }
    for (let i = 0; i < half; i++) {
      cards.push({ type: 'galgame_rate_card', attrs: { galgame_rate_id: i + 1 } })
    }
    const r = validateDocument(doc(cards), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_entity_card_nodes')).toBe(true)
  })

  it('comment 放任意 image_block / entity card 都因 preset 限制 (0) 被拒', () => {
    const r = validateDocument(
      doc([
        {
          type: 'image_block',
          attrs: {
            media_asset_id: 1,
            src: 'x',
            alt: null,
            caption: null,
            width: 1,
            height: 1,
          },
        },
      ]),
      COMMENT_PRESET,
    )
    expect(r.ok).toBe(false)
  })

  it('text_length 用 code point 计数, 中日韩字符各计 1', () => {
    const sentence = '光凪'.repeat(COMMENT_PRESET.limits.max_plain_text_chars + 1)
    const r = validateDocument(doc([p(text(sentence))]), COMMENT_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'limit_exceeded_plain_text_chars')).toBe(true)
  })
})

import { ARTICLE_PRESET, COMMENT_PRESET, POST_PRESET, validateDocument } from '../src/index'

function doc(content: object[]): object {
  return { type: 'doc', content }
}

function p(...children: object[]): object {
  return { type: 'paragraph', content: children }
}

function text(t: string, marks?: object[]): object {
  const node: Record<string, unknown> = { type: 'text', text: t }
  if (marks) node.marks = marks
  return node
}

describe('validateDocument: 基础', () => {
  it('合法的最小文档通过 article preset', () => {
    const result = validateDocument(doc([p(text('Hello'))]), ARTICLE_PRESET)
    expect(result.ok).toBe(true)
    expect(result.issues).toEqual([])
  })

  it('根节点不是 doc 时拒绝', () => {
    const result = validateDocument({ type: 'paragraph' }, ARTICLE_PRESET)
    expect(result.ok).toBe(false)
    expect(result.issues[0]?.code).toBe('document_not_doc_root')
  })

  it('非对象输入拒绝', () => {
    const result = validateDocument(null, ARTICLE_PRESET)
    expect(result.ok).toBe(false)
    expect(result.issues[0]?.code).toBe('document_not_doc_root')
  })

  it('未知 node 拒绝且报路径', () => {
    const result = validateDocument(doc([{ type: 'evil' }]), ARTICLE_PRESET)
    expect(result.ok).toBe(false)
    const issue = result.issues.find(i => i.code === 'unknown_node')
    expect(issue).toBeDefined()
    expect(issue?.path).toEqual(['content', 0])
  })

  it('未知 mark 拒绝', () => {
    const result = validateDocument(doc([p(text('x', [{ type: 'evil' }]))]), ARTICLE_PRESET)
    expect(result.ok).toBe(false)
    const issue = result.issues.find(i => i.code === 'unknown_mark')
    expect(issue).toBeDefined()
  })

  it('comment preset 接受 work card 但拒绝 image_block / heading / rate card', () => {
    const r1 = validateDocument(
      doc([
        {
          type: 'image_block',
          attrs: { media_asset_id: 1, src: 'k', alt: null, caption: null, width: 0, height: 0 },
        },
      ]),
      COMMENT_PRESET,
    )
    expect(r1.ok).toBe(false)
    const r2 = validateDocument(
      doc([{ type: 'heading', attrs: { level: 2 }, content: [text('x')] }]),
      COMMENT_PRESET,
    )
    expect(r2.ok).toBe(false)
    const r3 = validateDocument(
      doc([{ type: 'galgame_card', attrs: { galgame_id: 1 } }]),
      COMMENT_PRESET,
    )
    expect(r3.ok).toBe(true)
    const r4 = validateDocument(
      doc([{ type: 'galgame_rate_card', attrs: { galgame_rate_id: 1 } }]),
      COMMENT_PRESET,
    )
    expect(r4.ok).toBe(false)
  })

  it('comment preset 限制 work card 数量为 5', () => {
    const cards = (n: number) =>
      doc(Array.from({ length: n }, () => ({ type: 'galgame_card', attrs: { galgame_id: 1 } })))
    expect(validateDocument(cards(5), COMMENT_PRESET).ok).toBe(true)
    const over = validateDocument(cards(6), COMMENT_PRESET)
    expect(over.ok).toBe(false)
    expect(over.issues.some(i => i.code === 'limit_exceeded_entity_card_nodes')).toBe(true)
  })
})

describe('validateDocument: image_block attrs', () => {
  function imgDoc(attrs: Record<string, unknown>): object {
    return doc([{ type: 'image_block', attrs }])
  }

  it('合法 image_block 通过', () => {
    const r = validateDocument(
      imgDoc({
        media_asset_id: 123,
        src: 'community/2026/05/x.webp',
        alt: '截图',
        caption: '标题',
        width: 1280,
        height: 720,
      }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(true)
  })

  it('media_asset_id 缺失被拒', () => {
    const r = validateDocument(
      imgDoc({ media_asset_id: null, src: 'x', alt: null, caption: null, width: 0, height: 0 }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'invalid_attr_type')).toBe(true)
  })

  it('src 空字符串被拒', () => {
    const r = validateDocument(
      imgDoc({ media_asset_id: 1, src: '', alt: null, caption: null, width: 0, height: 0 }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'missing_required_attr')).toBe(true)
  })

  it('width 为负被拒', () => {
    const r = validateDocument(
      imgDoc({ media_asset_id: 1, src: 'x', alt: null, caption: null, width: -1, height: 0 }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'invalid_attr_type')).toBe(true)
  })

  it.each([
    ['javascript:alert(1)'],
    ['JavaScript:alert(1)'],
    ['data:text/html,<script>'],
    ['vbscript:msgbox(1)'],
    ['file:///etc/passwd'],
  ])('src=%s 协议被拒', src => {
    const r = validateDocument(
      imgDoc({ media_asset_id: 1, src, alt: null, caption: null, width: 0, height: 0 }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'invalid_media_src_scheme')).toBe(true)
  })

  it('object key 形式的 src 通过', () => {
    const r = validateDocument(
      imgDoc({
        media_asset_id: 1,
        src: 'community/2026/05/a.webp',
        alt: null,
        caption: null,
        width: 1280,
        height: 720,
      }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(true)
  })

  it('https URL 形式的 src 通过 (过渡期允许外链)', () => {
    const r = validateDocument(
      imgDoc({
        media_asset_id: 1,
        src: 'https://images.example.com/x.webp',
        alt: null,
        caption: null,
        width: 1280,
        height: 720,
      }),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(true)
  })
})

describe('validateDocument: entity card attrs', () => {
  it('每种 entity card 都需要 typed FK 正整数', () => {
    const cards: Array<[string, string]> = [
      ['galgame_card', 'galgame_id'],
      ['light_novel_card', 'light_novel_id'],
      ['light_novel_volume_card', 'light_novel_volume_id'],
      ['manga_card', 'manga_id'],
      ['person_card', 'person_id'],
      ['producer_card', 'producer_id'],
      ['character_card', 'character_id'],
      ['article_card', 'article_id'],
      ['post_card', 'post_id'],
      ['galgame_rate_card', 'galgame_rate_id'],
      ['light_novel_rate_card', 'light_novel_rate_id'],
      ['manga_rate_card', 'manga_rate_id'],
    ]
    for (const [type, key] of cards) {
      const ok = validateDocument(doc([{ type, attrs: { [key]: 7 } }]), ARTICLE_PRESET)
      expect(ok.ok).toBe(true)
      const missing = validateDocument(doc([{ type, attrs: {} }]), ARTICLE_PRESET)
      expect(missing.ok).toBe(false)
      expect(missing.issues[0]?.code).toBe('missing_required_attr')
      const wrong = validateDocument(doc([{ type, attrs: { [key]: -1 } }]), ARTICLE_PRESET)
      expect(wrong.ok).toBe(false)
      expect(wrong.issues[0]?.code).toBe('invalid_attr_type')
    }
  })
})

describe('validateDocument: mention_user attrs', () => {
  it('mention_user_id 必填正整数', () => {
    const ok = validateDocument(
      doc([p({ type: 'mention_user', attrs: { mention_user_id: 11 } })]),
      ARTICLE_PRESET,
    )
    expect(ok.ok).toBe(true)
    const bad = validateDocument(doc([p({ type: 'mention_user', attrs: {} })]), ARTICLE_PRESET)
    expect(bad.ok).toBe(false)
    expect(bad.issues[0]?.code).toBe('missing_required_attr')
  })
})

describe('validateDocument: emoji_inline attrs', () => {
  it('合法复合 emoji_code (set_name:emoji_name) 通过', () => {
    const r = validateDocument(
      doc([p({ type: 'emoji_inline', attrs: { emoji_code: 'hikari:wink' } })]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(true)
  })

  it('set_name / emoji_name 含中日韩字母通过 (\\p{L}\\p{N}_- + length 2-16:1-32)', () => {
    const r = validateDocument(
      doc([p({ type: 'emoji_inline', attrs: { emoji_code: '公主连结:害怕' } })]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(true)
  })

  it('emoji_code 含空格/HTML 元字符被拒 (PR-2 收紧规则)', () => {
    for (const code of [
      'Alice In Cradle:害怕',
      'set:<script>',
      'set:emoji name',
      'set:emoji/path',
    ]) {
      const r = validateDocument(
        doc([p({ type: 'emoji_inline', attrs: { emoji_code: code } })]),
        ARTICLE_PRESET,
      )
      expect(r.ok).toBe(false)
    }
  })

  it('裸 emoji_name 无 set 前缀被拒 (强制复合形态)', () => {
    const r = validateDocument(
      doc([p({ type: 'emoji_inline', attrs: { emoji_code: 'blob_cat' } })]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_emoji_code')
  })

  it('空 emoji_code 被拒', () => {
    const r = validateDocument(
      doc([p({ type: 'emoji_inline', attrs: { emoji_code: '' } })]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('missing_required_attr')
  })

  it('多 : 分隔符被拒 (只允许一个分隔)', () => {
    const r = validateDocument(
      doc([p({ type: 'emoji_inline', attrs: { emoji_code: 'a:b:c' } })]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_emoji_code')
  })
})

describe('validateDocument: link mark href scheme', () => {
  function linked(href: string): object {
    return doc([p(text('x', [{ type: 'link', attrs: { href } }]))])
  }

  it('https URL 通过', () => {
    expect(validateDocument(linked('https://example.com'), ARTICLE_PRESET).ok).toBe(true)
  })

  it('站内绝对路径通过', () => {
    expect(validateDocument(linked('/galgames/45'), ARTICLE_PRESET).ok).toBe(true)
  })

  it('http 被拒', () => {
    const r = validateDocument(linked('http://example.com'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('javascript: 被拒', () => {
    const r = validateDocument(linked('javascript:alert(1)'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('data: 被拒', () => {
    const r = validateDocument(linked('data:text/html,<script>'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('vbscript: 被拒', () => {
    const r = validateDocument(linked('vbscript:msgbox(1)'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('协议相对 // 被拒', () => {
    const r = validateDocument(linked('//attacker.com'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('mailto: 被拒', () => {
    const r = validateDocument(linked('mailto:a@b.c'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })

  it('外部站不在 SAFE_INTERNAL_PATH 白名单的根路径被拒', () => {
    const r = validateDocument(linked('/admin/secret'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues[0]?.code).toBe('invalid_url_scheme')
  })
})

describe('validateDocument: text_style 颜色', () => {
  function colored(color: unknown): object {
    return doc([p(text('x', [{ type: 'text_style', attrs: { color } }]))])
  }

  it.each([['#ff0000'], ['#f00'], ['rgb(0, 216, 255)'], ['rgba(255,0,0,0.5)'], ['red']])(
    '安全颜色 %s 通过',
    color => {
      expect(validateDocument(colored(color), ARTICLE_PRESET).ok).toBe(true)
    },
  )

  it.each([['var(--ba0_s, #000000)'], ['url(x)'], ['expression(1)'], ['#zzz'], ['rgb(0;0;0)']])(
    '不安全颜色 %s 被拒',
    color => {
      const r = validateDocument(colored(color), ARTICLE_PRESET)
      expect(r.ok).toBe(false)
      expect(r.issues.some(i => i.code === 'invalid_attr_type')).toBe(true)
    },
  )

  it('color=null 通过 (无色 mark)', () => {
    expect(validateDocument(colored(null), ARTICLE_PRESET).ok).toBe(true)
  })

  it('comment preset 不允许 text_style', () => {
    const r = validateDocument(colored('#ff0000'), COMMENT_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'unknown_mark')).toBe(true)
  })
})

describe('validateDocument: text_align', () => {
  function aligned(text_align: unknown): object {
    return doc([{ type: 'paragraph', attrs: { text_align }, content: [text('x')] }])
  }

  it.each([['left'], ['center'], ['right'], ['justify']])('合法对齐 %s 通过', a => {
    expect(validateDocument(aligned(a), ARTICLE_PRESET).ok).toBe(true)
  })

  it('非法对齐值被拒', () => {
    const r = validateDocument(aligned('top'), ARTICLE_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.some(i => i.code === 'invalid_attr_type')).toBe(true)
  })

  it('heading 也支持 text_align', () => {
    const ok = validateDocument(
      doc([{ type: 'heading', attrs: { level: 2, text_align: 'center' }, content: [text('x')] }]),
      ARTICLE_PRESET,
    )
    expect(ok.ok).toBe(true)
  })

  it('text_align=null 通过', () => {
    expect(validateDocument(aligned(null), ARTICLE_PRESET).ok).toBe(true)
  })
})

describe('validateDocument: 多 issue 聚合', () => {
  it('一次返回全部 issue, 不 short-circuit', () => {
    const r = validateDocument(
      doc([{ type: 'evil_one' }, { type: 'evil_two' }, p(text('x', [{ type: 'evil_mark' }]))]),
      ARTICLE_PRESET,
    )
    expect(r.ok).toBe(false)
    expect(r.issues.filter(i => i.code === 'unknown_node').length).toBe(2)
    expect(r.issues.some(i => i.code === 'unknown_mark')).toBe(true)
  })
})

describe('validateDocument: POST_PRESET 限额比 article 更严', () => {
  it('文章 PRESET 接受的大 JSON 在 POST_PRESET 下被限额拒绝', () => {
    const paragraphs: object[] = []
    for (let i = 0; i < 5000; i++) paragraphs.push(p(text('文'.repeat(10))))
    const big = doc(paragraphs)
    const inArticle = validateDocument(big, ARTICLE_PRESET)
    expect(inArticle.ok).toBe(true)
    const inPost = validateDocument(big, POST_PRESET)
    expect(inPost.ok).toBe(false)
    expect(inPost.issues.some(i => i.code === 'limit_exceeded_json_bytes')).toBe(true)
  })
})

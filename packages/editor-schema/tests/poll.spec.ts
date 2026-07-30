import { ARTICLE_PRESET, COMMENT_PRESET, POST_PRESET, validateDocument } from '../src/index'

function doc(content: object[]): object {
  return { type: 'doc', content }
}

function poll(attrs: object): object {
  return { type: 'poll', attrs }
}

const validAttrs = {
  poll_key: 'k1',
  question: '你最喜欢哪部?',
  options: ['A', 'B', 'C'],
  allow_multiple: false,
  closes_at: null,
}

describe('poll node validation', () => {
  it('合法 poll 节点通过 post 与 article preset', () => {
    expect(validateDocument(doc([poll(validAttrs)]), POST_PRESET).ok).toBe(true)
    expect(validateDocument(doc([poll(validAttrs)]), ARTICLE_PRESET).ok).toBe(true)
  })

  it('缺少 poll_key 时拒绝', () => {
    const r = validateDocument(doc([poll({ ...validAttrs, poll_key: '' })]), POST_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'missing_required_attr')).toBeDefined()
  })

  it('问题为空时拒绝', () => {
    const r = validateDocument(doc([poll({ ...validAttrs, question: '   ' })]), POST_PRESET)
    expect(r.ok).toBe(false)
  })

  it('选项少于 2 个时拒绝', () => {
    const r = validateDocument(doc([poll({ ...validAttrs, options: ['A'] })]), POST_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'invalid_attr_type')).toBeDefined()
  })

  it('选项含空字符串时拒绝', () => {
    const r = validateDocument(doc([poll({ ...validAttrs, options: ['A', ' '] })]), POST_PRESET)
    expect(r.ok).toBe(false)
  })

  it('max_choices 超过选项数时拒绝', () => {
    const r = validateDocument(
      doc([poll({ ...validAttrs, allow_multiple: true, max_choices: 5 })]),
      POST_PRESET,
    )
    expect(r.ok).toBe(false)
  })

  it('合法 max_choices / anonymous / allow_change 通过', () => {
    const r = validateDocument(
      doc([
        poll({
          ...validAttrs,
          allow_multiple: true,
          max_choices: 2,
          anonymous: false,
          allow_change: false,
        }),
      ]),
      POST_PRESET,
    )
    expect(r.ok).toBe(true)
  })

  it('comment preset 不允许 poll 节点', () => {
    const r = validateDocument(doc([poll(validAttrs)]), COMMENT_PRESET)
    expect(r.ok).toBe(false)
    expect(
      r.issues.find(i => i.code === 'forbidden_top_level_node' || i.code === 'unknown_node'),
    ).toBeDefined()
  })

  it('超过 max_poll_nodes (post=3) 时报 limit_exceeded_poll_nodes', () => {
    const four = [1, 2, 3, 4].map(n => poll({ ...validAttrs, poll_key: `k${n}` }))
    const r = validateDocument(doc(four), POST_PRESET)
    expect(r.ok).toBe(false)
    expect(r.issues.find(i => i.code === 'limit_exceeded_poll_nodes')).toBeDefined()
  })
})

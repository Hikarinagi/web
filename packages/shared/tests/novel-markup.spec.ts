import {
  parseNovelMarkup,
  serializeNovelMarkup,
  stripNovelMarkup,
  stripNovelRuby,
  stripNovelTags,
} from '../src/novel-markup'

describe('novel markup', () => {
  it('按竖线加双书名号识别注音，按双层书名号识别着重号', () => {
    expect(parseNovelMarkup('他看向｜魔法少女《まほうしょうじょ》，《《绝对》》不会输。')).toEqual([
      { kind: 'text', text: '他看向' },
      { kind: 'ruby', base: '魔法少女', ruby: 'まほうしょうじょ' },
      { kind: 'text', text: '，' },
      { kind: 'emphasis', text: '绝对' },
      { kind: 'text', text: '不会输。' },
    ])
  })

  it('没有竖线的中文书名号保持原文', () => {
    expect(parseNovelMarkup('她读过《狼与香辛料》。')).toEqual([
      { kind: 'text', text: '她读过《狼与香辛料》。' },
    ])
  })

  it('解析后再序列化得到原文', () => {
    const text = '｜東京《とうきょう》的《《雨》》下个不停'
    expect(serializeNovelMarkup(parseNovelMarkup(text))).toBe(text)
  })

  it('去掉记法后只留正文', () => {
    expect(stripNovelMarkup('｜東京《とうきょう》的《《雨》》')).toBe('東京的雨')
  })

  it('删除注音，保留基字和着重号。', () => {
    expect(stripNovelRuby('｜東京《とうきょう》的《《雨》》')).toBe('東京的《《雨》》')
  })

  it('开启标记后识别成对标记与独立标记，并能原样序列化', () => {
    const text = '{1}二十{/1}岁的｜魔女《まじょ》{2/}'
    const runs = parseNovelMarkup(text, { tags: true })
    expect(runs).toEqual([
      { kind: 'tag', id: 1, role: 'open' },
      { kind: 'text', text: '二十' },
      { kind: 'tag', id: 1, role: 'close' },
      { kind: 'text', text: '岁的' },
      { kind: 'ruby', base: '魔女', ruby: 'まじょ' },
      { kind: 'tag', id: 2, role: 'self' },
    ])
    expect(serializeNovelMarkup(runs)).toBe(text)
    expect(stripNovelMarkup(text, { tags: true })).toBe('二十岁的魔女')
    expect(stripNovelRuby(text, { tags: true })).toBe('{1}二十{/1}岁的魔女{2/}')
    expect(stripNovelTags(text)).toBe('二十岁的｜魔女《まじょ》')
  })

  it('不开启标记时花括号保持原文；写法不对的标记也按原文处理', () => {
    expect(parseNovelMarkup('{1}二十{/1}')).toEqual([{ kind: 'text', text: '{1}二十{/1}' }])
    expect(parseNovelMarkup('{/1/}与{0}', { tags: true })).toEqual([
      { kind: 'text', text: '{/1/}与{0}' },
    ])
  })
})

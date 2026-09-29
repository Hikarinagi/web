import {
  parseNovelMarkup,
  serializeNovelMarkup,
  stripNovelMarkup,
  stripNovelRuby,
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
})

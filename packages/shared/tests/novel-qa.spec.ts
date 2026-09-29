import { checkNovelTranslation } from '../src/novel-qa'

const terms = [
  { source: 'ホロ', target: '赫萝', forbidden: false },
  { source: 'ホロ', target: '荷萝', forbidden: true },
]

describe('checkNovelTranslation', () => {
  it('空译文只报一条错误', () => {
    expect(
      checkNovelTranslation({
        source: 'ホロは笑った。',
        target: '  ',
        targetLang: 'zh-Hans',
        terms,
      }),
    ).toEqual([{ level: 'error', code: 'empty', message: '译文为空' }])
  })

  it('使用禁用译法是错误，没用术语表译法是警告', () => {
    const issues = checkNovelTranslation({
      source: 'ホロは笑った。',
      target: '荷萝笑了。',
      targetLang: 'zh-Hans',
      terms,
    })
    expect(issues.map(issue => [issue.level, issue.code])).toEqual([
      ['warning', 'term_missing'],
      ['error', 'forbidden_term'],
    ])
  })

  it('换行数不一致与中文里的半角标点分别报出', () => {
    const issues = checkNovelTranslation({
      source: '一行。',
      target: '第一行,\n第二行。',
      targetLang: 'zh-Hans',
      terms: [],
    })
    expect(issues.map(issue => issue.code)).toEqual(['line_count', 'halfwidth_punctuation'])
  })

  it('注音与着重号记法不影响检查', () => {
    expect(
      checkNovelTranslation({
        source: '｜ホロ《ほろ》は笑った。',
        target: '｜赫萝《hè luó》笑了。',
        targetLang: 'zh-Hans',
        terms,
      }),
    ).toEqual([])
  })
})

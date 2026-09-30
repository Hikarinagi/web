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

  describe('标记', () => {
    const check = (target: string) =>
      checkNovelTranslation({
        source: '{1}二十{/1}歳の{2}ホロ{/2}{3/}',
        target,
        targetLang: 'zh-Hans',
        terms,
        tags: true,
      })

    it('标记齐全时顺序可以调整，标记本身不算半角标点', () => {
      expect(check('{2}赫萝{/2}{1}二十{/1}岁{3/}')).toEqual([])
    })

    it('成对标记里的半角字符沿用原书排版，不报半角标点', () => {
      const issues = (target: string) =>
        checkNovelTranslation({
          source: '「ふざけるなっ{1}!!{/1}」',
          target,
          targetLang: 'zh-Hans',
          terms: [],
          tags: true,
        }).map(issue => issue.code)
      expect(issues('「别开玩笑了{1}!!{/1}」')).toEqual([])
      expect(issues('「别开玩笑了!{1}!!{/1}」')).toEqual(['halfwidth_punctuation'])
    })

    it('缺少与多出的标记分别报错', () => {
      expect(check('{1}二十{/1}岁的赫萝{4/}').map(issue => issue.message)).toEqual([
        '缺少标记：{2}',
        '缺少标记：{/2}',
        '缺少标记：{3/}',
        '标记不在原文中：{4/}',
      ])
    })

    it('成对标记交叉或顺序颠倒时报错', () => {
      expect(check('{1}二十{2}岁{/1}赫萝{/2}{3/}')).toEqual([
        { level: 'error', code: 'tag_mismatch', message: '标记未正确配对或嵌套' },
      ])
      expect(check('{/1}二十{1}{2}赫萝{/2}{3/}').map(issue => issue.code)).toEqual(['tag_mismatch'])
    })
  })
})

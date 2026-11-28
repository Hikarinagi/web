import { parse } from '@formatjs/icu-messageformat-parser'
import { HIKARI_BIZ_CODE } from '../src/api/error'
import { DEFAULT_LOCALE, SHARED_MESSAGES } from '../src/locales'
import {
  NOTIFICATION_MESSAGES,
  REVIEW_MESSAGES,
  formatMessage,
  renderText,
} from '../src/notification'

function templates(node: unknown, prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]]
  return Object.entries(node as Record<string, unknown>).flatMap(([key, child]) =>
    templates(child, prefix ? `${prefix}.${key}` : key),
  )
}

const ICU_MODULES = ['intl-messageformat', '@formatjs/icu-messageformat-parser']

function loadedIcu(entry: string): string[] {
  const loaded: string[] = []
  jest.isolateModules(() => {
    for (const name of ICU_MODULES) {
      jest.doMock(name, () => {
        loaded.push(name)
        return jest.requireActual(name)
      })
    }
    require(entry)
  })
  return loaded.sort()
}

describe('formatMessage', () => {
  it('fills named placeholders', () => {
    expect(
      formatMessage('等 {count} 人赞了你的{noun}', { count: 3, noun: '评论' }, DEFAULT_LOCALE),
    ).toBe('等 3 人赞了你的评论')
  })

  it('prints numbers in simple placeholders without grouping', () => {
    expect(formatMessage('有 {count} 次', { count: 12345 }, DEFAULT_LOCALE)).toBe('有 12345 次')
  })

  it('picks the select branch named by an enum code', () => {
    const template = '{kind, select, volume {第 {number} 卷} other {番外}}'
    expect(formatMessage(template, { kind: 'volume', number: 3 }, DEFAULT_LOCALE)).toBe('第 3 卷')
    expect(formatMessage(template, { kind: 'extra' }, DEFAULT_LOCALE)).toBe('番外')
  })

  it('formats a declared date argument from an ISO string in the Shanghai time zone', () => {
    const template = '截止于 {deadline, date, ::yyyyMMdd} {deadline, time, ::HHmm}'
    expect(formatMessage(template, { deadline: '2026-12-31T16:30:00.000Z' }, DEFAULT_LOCALE)).toBe(
      '截止于 2027/01/01 00:30',
    )
  })

  it('fills a date declared with a project pattern from its Shanghai time parts', () => {
    const template = '请在 {deadline, date, month_day_time} 前领取'
    expect(formatMessage(template, { deadline: '2026-12-31T16:30:00.000Z' }, DEFAULT_LOCALE)).toBe(
      '请在 1 月 1 日 00:30 前领取',
    )
    expect(formatMessage(template, { deadline: '2026-03-05T01:05:00.000Z' }, DEFAULT_LOCALE)).toBe(
      '请在 3 月 5 日 09:05 前领取',
    )
  })

  it('throws on a date argument that is not a valid time, so the renderer drops the line', () => {
    expect(() =>
      formatMessage(
        '请在 {deadline, date, month_day_time} 前',
        { deadline: 'soon' },
        DEFAULT_LOCALE,
      ),
    ).toThrow(RangeError)
  })

  it('leaves an ISO string untouched when the template does not declare it as a date', () => {
    expect(
      formatMessage('原文 {deadline}', { deadline: '2026-12-31T16:30:00.000Z' }, DEFAULT_LOCALE),
    ).toBe('原文 2026-12-31T16:30:00.000Z')
  })

  it('treats angle brackets in a template as text', () => {
    expect(formatMessage('<b>{name}</b>', { name: 'A' }, DEFAULT_LOCALE)).toBe('<b>A</b>')
  })

  it('formats a declared percent with one decimal', () => {
    expect(formatMessage('{rate, number, ::percent .0}', { rate: 0.005 }, DEFAULT_LOCALE)).toBe(
      '0.5%',
    )
  })
})

describe('renderText', () => {
  it('renders a template by key path', () => {
    expect(
      renderText({ key: 'interaction.like.many.post', params: { count: 2 } }, DEFAULT_LOCALE),
    ).toBe('等 2 人赞了你的图文')
  })

  it('renders a review reason from its own pack', () => {
    expect(renderText({ key: 'review.reason.bundle', params: {} }, DEFAULT_LOCALE)).toBe(
      '疑似多卷合集，非单卷',
    )
  })

  it('returns null for a key that is not a template', () => {
    expect(renderText({ key: 'interaction.like' as never, params: {} }, DEFAULT_LOCALE)).toBeNull()
    expect(
      renderText({ key: 'interaction.missing.title' as never, params: {} }, DEFAULT_LOCALE),
    ).toBeNull()
    expect(renderText({ key: 'review.missing' as never, params: {} }, DEFAULT_LOCALE)).toBeNull()
    expect(renderText({ key: 'review' as never, params: {} }, DEFAULT_LOCALE)).toBeNull()
  })

  it('returns null instead of throwing when a parameter is missing', () => {
    expect(renderText({ key: 'group.added.title', params: {} }, DEFAULT_LOCALE)).toBeNull()
  })

  it('keeps user text that looks like message syntax as plain text', () => {
    expect(
      renderText(
        { key: 'group.added.title', params: { group_name: "{x} '#' <b>" } },
        DEFAULT_LOCALE,
      ),
    ).toBe("把你加入了「{x} '#' <b>」")
  })

  it('renders a parameter that is itself a message before filling the outer template', () => {
    const position = { key: 'manga.position' as const, params: { position: 'volume', number: 3 } }
    expect(
      renderText(
        {
          key: 'workbench.rejected.system',
          params: { work: { key: 'manga.work', params: { series: '中文名', position } } },
        },
        DEFAULT_LOCALE,
      ),
    ).toBe('你的项目《中文名 第 3 卷》已退回')
    expect(
      renderText(
        {
          key: 'workbench.note',
          params: { note: { key: 'review.reason.unsure', params: { position } } },
        },
        DEFAULT_LOCALE,
      ),
    ).toBe('说明：文件看起来是第 3 卷，但依据不足。')
  })

  it('returns null when a nested message is unknown, malformed or missing a parameter', () => {
    const render = (work: unknown) =>
      renderText(
        { key: 'workbench.rejected.system', params: { work: work as never } },
        DEFAULT_LOCALE,
      )
    expect(render({ key: 'manga.missing', params: {} })).toBeNull()
    expect(render({ key: 'manga.position' })).toBeNull()
    expect(render({ params: {} })).toBeNull()
    expect(render(null)).toBeNull()
    expect(render({ key: 'manga.work', params: { series: '中文名' } })).toBeNull()
  })

  it('stops at a nesting depth no template needs', () => {
    let work: unknown = { key: 'manga.position', params: { position: 'single' } }
    for (let depth = 0; depth < 3; depth++) {
      work = { key: 'manga.work', params: { series: '中文名', position: work } }
    }
    expect(
      renderText(
        { key: 'workbench.rejected.system', params: { work: work as never } },
        DEFAULT_LOCALE,
      ),
    ).toBe('你的项目《中文名 中文名 中文名 单行本》已退回')
    work = { key: 'manga.work', params: { series: '中文名', position: work } }
    expect(
      renderText(
        { key: 'workbench.rejected.system', params: { work: work as never } },
        DEFAULT_LOCALE,
      ),
    ).toBeNull()
  })
})

describe('SHARED_MESSAGES', () => {
  it('has a default message for every biz code', () => {
    for (const code of Object.values(HIKARI_BIZ_CODE)) {
      expect(typeof SHARED_MESSAGES['zh-CN'].bizCode[code]).toBe('string')
    }
  })

  it('leaves the server-rendered templates out of the client-facing pack', () => {
    expect(Object.keys(SHARED_MESSAGES['zh-CN'])).toEqual(['bizCode'])
  })
})

describe('main entry', () => {
  it('loads neither the ICU formatter nor its parser', () => {
    expect(loadedIcu('../src/index')).toEqual([])
  })

  it('would notice an entry that pulls ICU in', () => {
    expect(loadedIcu('../src/notification')).toEqual([...ICU_MODULES].sort())
  })
})

describe('server-rendered templates', () => {
  const all = [
    ...templates(NOTIFICATION_MESSAGES['zh-CN']),
    ...templates({ review: REVIEW_MESSAGES['zh-CN'] }),
  ]

  it('names every key segment in snake_case or as an enum value', () => {
    for (const [key] of all) {
      for (const segment of key.split('.')) expect(segment).toMatch(/^([a-z][a-z_]*|[A-Z][A-Z_]*)$/)
    }
  })

  it('keeps the review namespace out of the notification pack', () => {
    expect(Object.keys(NOTIFICATION_MESSAGES['zh-CN'])).not.toContain('review')
  })

  it.each(templates({ review: REVIEW_MESSAGES['zh-CN'] }))(
    'leaves %s without an ending of its own, since the note line adds 。',
    (_key, template) => {
      expect(template).not.toMatch(/[。．.！!？?；;]$/u)
    },
  )

  it('parses every template as an ICU message', () => {
    for (const [, template] of all) {
      expect(() => parse(template, { ignoreTag: true })).not.toThrow()
    }
  })
})

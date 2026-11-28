import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { TYPE, parse, type MessageFormatElement } from '@formatjs/icu-messageformat-parser'
import { NOTIFICATION_MESSAGES, REVIEW_MESSAGES } from '../src/notification'

type Kind = string | { [form: string]: Record<string, Signature> }
type Signature = Record<string, Kind>

const KIND: Partial<Record<TYPE, string>> = {
  [TYPE.argument]: 'argument',
  [TYPE.number]: 'number',
  [TYPE.date]: 'date',
  [TYPE.time]: 'time',
}

function signatureOf(elements: MessageFormatElement[]): Signature {
  const out: Signature = {}
  for (const element of elements) {
    if (element.type === TYPE.tag) Object.assign(out, signatureOf(element.children))
    else if (element.type === TYPE.select || element.type === TYPE.plural) {
      out[element.value] = {
        [element.type === TYPE.select ? 'select' : 'plural']: Object.fromEntries(
          Object.entries(element.options).map(([branch, option]) => [
            branch,
            signatureOf(option.value),
          ]),
        ),
      }
    } else {
      const kind = KIND[element.type]
      if (kind && 'value' in element) out[element.value] = kind
    }
  }
  return out
}

const signature = (template: string) => signatureOf(parse(template, { ignoreTag: true }))

function missing(current: Signature, published: Signature, path: string): string[] {
  return Object.entries(published).flatMap(([name, kind]) => {
    const now = current[name]
    if (now === undefined) return [`${path} lost {${name}}`]
    if (typeof kind === 'string' || typeof now === 'string') {
      return JSON.stringify(now) === JSON.stringify(kind) ? [] : [`${path} changed {${name}}`]
    }
    return Object.entries(kind).flatMap(([form, branches]) => {
      const nowBranches = now[form]
      if (!nowBranches) return [`${path} turned {${name}} from ${form}`]
      return Object.entries(branches).flatMap(([branch, nested]) =>
        nowBranches[branch]
          ? missing(nowBranches[branch], nested, `${path}.${name}=${branch}`)
          : [`${path} lost branch ${branch} of {${name}}`],
      )
    })
  })
}

function added(
  current: Signature,
  published: Signature,
  inherited: Set<string>,
  path: string,
): string[] {
  const stored = new Set([...inherited, ...Object.keys(published)])
  return Object.entries(current).flatMap(([name, kind]) => {
    if (!stored.has(name)) return [`${path} needs {${name}} that stored rows may lack`]
    const before = published[name]
    if (typeof kind === 'string' || typeof before !== 'object') return []
    return Object.entries(kind).flatMap(([form, branches]) =>
      Object.entries(branches).flatMap(([branch, nested]) => {
        const old = before[form] ?? {}
        return added(nested, old[branch] ?? old.other ?? {}, stored, `${path}.${name}=${branch}`)
      }),
    )
  })
}

const PUBLISHED = JSON.parse(
  readFileSync(join(__dirname, '../src/notification/published-keys.json'), 'utf8'),
) as Record<string, Signature>

function templates(node: unknown, prefix = ''): [string, string][] {
  if (typeof node === 'string') return [[prefix, node]]
  return Object.entries(node as Record<string, unknown>).flatMap(([key, child]) =>
    templates(child, prefix ? `${prefix}.${key}` : key),
  )
}

const CURRENT = new Map(
  [
    ...templates(NOTIFICATION_MESSAGES['zh-CN']),
    ...templates({ review: REVIEW_MESSAGES['zh-CN'] }),
  ].map(([key, template]) => [key, signature(template)] as const),
)

describe('published server-rendered keys', () => {
  it.each(Object.keys(PUBLISHED))('still has %s', key => {
    expect(CURRENT.has(key)).toBe(true)
  })

  it.each(Object.entries(PUBLISHED))(
    'keeps every param, type and branch %s was published with',
    (key, published) => {
      expect(missing(CURRENT.get(key) ?? {}, published, key)).toEqual([])
    },
  )

  it.each(Object.entries(PUBLISHED))(
    'asks %s for nothing its stored rows may lack',
    (key, published) => {
      expect(added(CURRENT.get(key) ?? {}, published, new Set(), key)).toEqual([])
    },
  )

  it.each([...CURRENT.keys()])('lists %s in the manifest', key => {
    expect(PUBLISHED).toHaveProperty([key])
  })
})

describe('signature checks', () => {
  const published = signature(
    '{count} {position, select, volume {第 {number} 卷} other {番外{title}}}',
  )
  const check = (template: string) => [
    ...missing(signature(template), published, 'k'),
    ...added(signature(template), published, new Set(), 'k'),
  ]

  it('accepts the published template and a new branch that uses only what other had', () => {
    expect(
      check('{count} {position, select, volume {第 {number} 卷} other {番外{title}}}'),
    ).toEqual([])
    expect(
      check(
        '{count} {position, select, volume {第 {number} 卷} named {{title}{count}} other {番外{title}}}',
      ),
    ).toEqual([])
  })

  it('catches a renamed or dropped branch', () => {
    expect(check('{count} {position, select, vol {第 {number} 卷} other {番外{title}}}')).toEqual([
      'k lost branch volume of {position}',
      'k.position=vol needs {number} that stored rows may lack',
    ])
    expect(check('{count} {position, select, other {番外{title}}}')).toEqual([
      'k lost branch volume of {position}',
    ])
  })

  it('catches a param added to a published branch or to a new branch beyond other', () => {
    expect(
      check('{count} {position, select, volume {第 {number} 卷{edition}} other {番外{title}}}'),
    ).toEqual(['k.position=volume needs {edition} that stored rows may lack'])
    expect(
      check(
        '{count} {position, select, volume {第 {number} 卷} chapter {第 {number} 话} other {番外{title}}}',
      ),
    ).toEqual(['k.position=chapter needs {number} that stored rows may lack'])
  })

  it('catches a param whose type changed or a select turned into a plain argument', () => {
    expect(
      check('{count, number} {position, select, volume {第 {number} 卷} other {番外{title}}}'),
    ).toEqual(['k changed {count}'])
    expect(check('{count} {position}')).toEqual(['k changed {position}'])
  })
})

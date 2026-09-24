import { effectScope, type EffectScope } from 'vue'
import { useNovelIntake } from '~/features/contribute/useNovelIntake'
import { HikariApiError } from '~/utils/api/error'

vi.mock('~/features/contribute/epub-meta', () => ({
  readEpubMeta: vi.fn(async (file: File) =>
    file.name.startsWith('broken') ? null : { title: file.name, creators: [], isbns: [] },
  ),
}))

const volume = (id: number) => ({
  id,
  name: null,
  name_cn: null,
  volume_type: 'MAIN' as const,
  volume_number: id,
  volume_label: null,
  publication_date: null,
  covers: [],
  series: { id: 1, name: '系列', name_cn: null, nsfw: false },
})
const identified: Record<string, object> = {
  'a.epub': { verdict: 'missing', volume: { ...volume(1), has_epub: false } },
  'b.epub': { verdict: 'missing', volume: { ...volume(1), has_epub: false } },
  'c.epub': { verdict: 'present', volume: { ...volume(2), has_epub: true } },
  'd.epub': { verdict: 'unknown', volume: { ...volume(3), has_epub: false } },
}

type Options = { body?: FormData | { files: { key: string; filename: string }[] }; path?: object }
const request = vi.fn()
let scope: EffectScope

function setup() {
  scope = effectScope()
  return scope.run(() => useNovelIntake())!
}
const file = (name: string, size = 10) => new File(['x'.repeat(size)], name, { lastModified: 1 })

beforeEach(() => {
  request.mockReset()
  request.mockImplementation(async (url: string, options: Options = {}) => {
    if (url.endsWith('/epub/limits')) return { max_epub_bytes: 100 }
    if (url.endsWith('/epub/identify') && options.body && !(options.body instanceof FormData)) {
      return {
        items: options.body.files.map(({ key, filename }) => ({
          key,
          confidence: 90,
          series: null,
          ...identified[filename],
        })),
      }
    }
    throw new Error(`unexpected ${url}`)
  })
  vi.stubGlobal('hikariRequest', request)
})

afterEach(() => {
  scope.stop()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

it('读取并识别后分类，同一卷仅将先加入的文件列为待提交', async () => {
  const intake = setup()
  await intake.add([
    file('a.epub'),
    file('b.epub'),
    file('c.epub'),
    file('d.epub'),
    file('broken.epub'),
    file('big.epub', 200),
  ])
  const byName = Object.fromEntries(intake.items.value.map(item => [item.file.name, item]))

  expect(byName['a.epub']).toMatchObject({ stage: 'ready', verdict: 'missing' })
  expect(byName['c.epub']).toMatchObject({ verdict: 'present', volume: { id: 2 } })
  expect(byName['d.epub']).toMatchObject({
    verdict: 'unknown',
    volume: null,
    suggestion: { id: 3 },
  })
  expect(byName['broken.epub']?.verdict).toBe('unreadable')
  expect(byName['big.epub']?.verdict).toBe('oversize')
  expect(intake.plan.value.queue.map(item => item.file.name)).toEqual(['a.epub'])
  expect(intake.plan.value.duplicates.has(byName['b.epub']!.key)).toBe(true)

  await intake.add([file('a.epub')])
  expect(intake.items.value).toHaveLength(6)
})

it('手动选择的卷列为待提交，重新选择时识别结果转为候选', async () => {
  const intake = setup()
  await intake.add([file('a.epub'), file('b.epub'), file('d.epub')])
  const [a, b, d] = intake.items.value

  intake.pick(d!.key, volume(4))
  expect(intake.plan.value.queue.map(item => item.key)).toEqual([a!.key, d!.key])

  intake.release(a!.key)
  expect(intake.items.value[0]).toMatchObject({
    verdict: 'unknown',
    volume: null,
    suggestion: { id: 1, has_epub: false },
  })
  expect(intake.plan.value.queue.map(item => item.key)).toEqual([b!.key, d!.key])
})

it('识别接口失败时全部标为待确认，由用户手动选择', async () => {
  request.mockImplementation(async (url: string) => {
    if (url.endsWith('/epub/limits')) return { max_epub_bytes: 100 }
    throw new Error('down')
  })
  const intake = setup()
  await intake.add([file('a.epub')])
  expect(intake.items.value[0]).toMatchObject({
    stage: 'ready',
    verdict: 'unknown',
    error: '自动识别暂不可用，请手动选择对应的卷。',
  })
})

it('逐个上传并记录失败原因，随后轮询我的投稿更新校验结果', async () => {
  vi.useFakeTimers()
  const intake = setup()
  await intake.add([file('a.epub'), file('c.epub'), file('d.epub')])
  intake.pick(intake.items.value[2]!.key, volume(5))

  const base = request.getMockImplementation()!
  request.mockImplementation(async (url: string, options: Options = {}) => {
    if (url.endsWith('/epub/correction')) {
      const { id } = options.path as { id: number }
      if (id === 5) {
        throw new HikariApiError({
          status: 422,
          code: 'EPUB_REVIEW_INVALID_FILE' as never,
          message: '文件无法打开',
        })
      }
      return { id: 10, status: 'PENDING', reasons: [], created_at: '2026-09-24T00:00:00Z' }
    }
    if (url.endsWith('/user/me/epub/corrections')) {
      return {
        items: [{ id: 10, status: 'PASSED', reasons: [], created_at: '2026-09-24T00:00:00Z' }],
      }
    }
    return base(url, options)
  })

  await intake.submit()
  const [a, , d] = intake.items.value
  expect(a).toMatchObject({ stage: 'submitted', review: { id: 10, status: 'PENDING' } })
  expect(d).toMatchObject({ stage: 'failed', error: '文件无法打开' })
  expect(intake.plan.value.queue).toHaveLength(0)

  await vi.advanceTimersByTimeAsync(5000)
  expect(intake.items.value[0]?.review?.status).toBe('PASSED')
})

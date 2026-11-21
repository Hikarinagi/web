import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStack } from '~/features/light-novel-reader/engine'

const rito = vi.hoisted(() => ({ createReader: vi.fn(), createController: vi.fn() }))

vi.mock('@ritojs/core', async importOriginal => ({
  ...(await importOriginal<typeof import('@ritojs/core')>()),
  createReader: rito.createReader,
}))

vi.mock('@ritojs/kit', async importOriginal => ({
  ...(await importOriginal<typeof import('@ritojs/kit')>()),
  createController: rito.createController,
}))

const saved = { href: 'Text/p-toc-002.xhtml', progression: 0 }

function open(initialLocator?: typeof saved) {
  return createStack({
    publication: {} as never,
    size: { width: 1280, height: 800 },
    margin: 48,
    spread: 'double',
    fontSize: 16,
    lineHeight: 1.8,
    theme: { background: '#fff', text: '#000' } as never,
    face: {} as never,
    effect: 'slide',
    initialLocator,
    annotations: {} as never,
    paintPage: () => {},
    prepare: async () => {},
  })
}

function readerError(code: string) {
  return Object.assign(new Error(`source locator href not found: ${saved.href}`), {
    name: 'RitoReaderError',
    code,
  })
}

describe('createStack', () => {
  const reader = { dispose: vi.fn() }

  beforeEach(() => {
    rito.createReader.mockReset()
    rito.createController.mockReset().mockReturnValue({})
  })

  it('opens at the saved position when the book still has it', async () => {
    rito.createReader.mockResolvedValue(reader)

    const stack = await open(saved)

    expect(rito.createReader).toHaveBeenCalledTimes(1)
    expect(rito.createReader.mock.calls[0]![2]).toMatchObject({ initialLocator: saved })
    expect(stack.initialLocator).toBe(saved)
  })

  it('opens at the start when the saved chapter is not in the current file', async () => {
    rito.createReader.mockRejectedValueOnce(readerError('invalid-locator'))
    rito.createReader.mockResolvedValueOnce(reader)

    const stack = await open(saved)

    expect(rito.createReader).toHaveBeenCalledTimes(2)
    expect(rito.createReader.mock.calls[1]![2].initialLocator).toBeUndefined()
    expect(stack.reader).toBe(reader)
    expect(stack.initialLocator).toBeUndefined()
  })

  it('reports any other engine failure without reopening', async () => {
    rito.createReader.mockRejectedValue(readerError('engine-failure'))

    await expect(open(saved)).rejects.toMatchObject({ code: 'engine-failure' })
    expect(rito.createReader).toHaveBeenCalledTimes(1)
  })

  it('reports an invalid position failure when it opened without a position', async () => {
    rito.createReader.mockRejectedValue(readerError('invalid-locator'))

    await expect(open()).rejects.toMatchObject({ code: 'invalid-locator' })
    expect(rito.createReader).toHaveBeenCalledTimes(1)
  })
})

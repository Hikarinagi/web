import { afterEach, describe, expect, it, vi } from 'vitest'
import { useReaderExit } from '~/components/reader/composables/useReaderExit'

const DETAIL = '/mangas/7'

function setup(back: string | null) {
  const navigate = vi.fn()
  const routerBack = vi.fn()
  vi.stubGlobal('navigateTo', navigate)
  vi.stubGlobal('useRouter', () => ({
    back: routerBack,
    options: { history: { state: { back } } },
  }))
  return { navigate, routerBack, exit: useReaderExit(() => DETAIL) }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('useReaderExit', () => {
  it('pops the history entry the reader was opened from', () => {
    const { navigate, routerBack, exit } = setup('/mangas/7')
    exit.back()
    expect(routerBack).toHaveBeenCalledOnce()
    // Pushing the detail page here is exactly what makes browser-back return
    // to the reader, so it must not happen.
    expect(navigate).not.toHaveBeenCalled()
  })

  it('falls back to the detail page when the reader was entered cold', () => {
    const { navigate, routerBack, exit } = setup(null)
    exit.back()
    expect(routerBack).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(DETAIL)
  })

  it('always navigates for an explicit exit, history or not', () => {
    const { navigate, routerBack, exit } = setup('/mangas/7')
    exit.exit()
    expect(routerBack).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith(DETAIL)
  })
})

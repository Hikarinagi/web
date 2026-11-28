import { HIKARI_BIZ_CODE } from '@hikarinagi/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { toastFailure, useDownloadEngine } from '~/features/download/useDownloadEngine'
import { HikariApiError } from '~/utils/api/error'

const danger = vi.hoisted(() => vi.fn())
vi.mock('@hina-ui/vue', () => ({ toast: { danger } }))

const permission = vi.hoisted(() => ({ state: 'denied' as PermissionState }))
vi.mock('~/features/download/engine/state', () => ({
  loadRun: vi.fn(async (taskId: number) => ({
    taskId,
    title: '作品',
    directory: { name: 'downloads', requestPermission: async () => permission.state },
    files: {},
    updatedAt: 0,
  })),
  listRuns: vi.fn(async () => []),
  deleteRun: vi.fn(async () => undefined),
  saveRun: vi.fn(async () => undefined),
}))

describe('toastFailure', () => {
  afterEach(() => {
    danger.mockReset()
  })

  it('leaves an API error to the request layer, which already showed it', () => {
    toastFailure(
      new HikariApiError({
        status: 429,
        code: HIKARI_BIZ_CODE.DOWNLOAD_DAILY_LIMITED,
        message: '今日下载额度已用完，请明天再试',
      }),
    )
    expect(danger).not.toHaveBeenCalled()
  })

  it('stays quiet when the user cancels', () => {
    toastFailure(new DOMException('The user aborted a request.', 'AbortError'))
    expect(danger).not.toHaveBeenCalled()
  })

  it('asks for folder access again when the browser refuses it', () => {
    toastFailure(new DOMException('The request is not allowed.', 'NotAllowedError'))
    expect(danger).toHaveBeenCalledWith('需要重新授权文件夹访问权限才能继续。')
  })

  it('shows local text instead of the raw browser message for any other failure', () => {
    toastFailure(new DOMException('The operation failed for an unknown transient reason.'))
    toastFailure(new TypeError('Failed to execute transaction on IDBDatabase'))
    expect(danger).toHaveBeenCalledTimes(2)
    expect(danger).toHaveBeenNthCalledWith(1, '保存失败，请稍后继续。')
    expect(danger).toHaveBeenNthCalledWith(2, '保存失败，请稍后继续。')
  })
})

describe('useDownloadEngine resume', () => {
  it('refuses to continue into a folder whose access was not granted again', async () => {
    const error = await useDownloadEngine()
      .resume({ id: 1, title: '作品', format: 'EPUB' })
      .catch((reason: unknown) => reason)
    expect(error).toMatchObject({ name: 'NotAllowedError' })
    toastFailure(error)
    expect(danger).toHaveBeenCalledWith('需要重新授权文件夹访问权限才能继续。')
  })
})

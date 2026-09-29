import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { saveFile } from '../../../app/features/download/saveFile'

describe('download file cleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:download')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('preserves the file and keeps its URL alive until after the click task', async () => {
    const data = Uint8Array.from([0, 255, 80, 75]).buffer
    vi.mocked(HTMLAnchorElement.prototype.click).mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.isConnected).toBe(true)
      expect(this.href).toBe('blob:download')
      expect(this.download).toBe('小说 - 第 2 卷.epub')
      expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    })
    saveFile(data, '小说 - 第 2 卷.epub', 'application/epub+zip')
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0]![0] as Blob
    expect(blob.type).toBe('application/epub+zip')
    expect(await blob.arrayBuffer()).toEqual(data)
    expect(document.querySelector('a[download]')).toBeNull()
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:download')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('releases every URL in a batch without retaining them for a minute', () => {
    const urls = ['blob:first', 'blob:second', 'blob:third']
    for (const [index, url] of urls.entries()) {
      vi.mocked(URL.createObjectURL).mockReturnValueOnce(url)
      saveFile(new ArrayBuffer(4), `${index + 1}.cbz`, 'application/vnd.comicbook+zip')
    }
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(3)
    expect(URL.revokeObjectURL).not.toHaveBeenCalled()
    vi.advanceTimersByTime(0)
    expect(vi.mocked(URL.revokeObjectURL).mock.calls).toEqual(urls.map(url => [url]))
    expect(vi.getTimerCount()).toBe(0)
  })

  it.each(['append', 'click'])('cleans up when %s fails without hiding the error', step => {
    const error = new Error('download failed')
    const action =
      step === 'append'
        ? vi.spyOn(document.body, 'appendChild')
        : vi.mocked(HTMLAnchorElement.prototype.click)
    action.mockImplementationOnce(() => {
      throw error
    })
    expect(() => saveFile(new ArrayBuffer(4), 'comic.cbz', 'application/zip')).toThrow(error)
    expect(document.querySelector('a[download]')).toBeNull()
    vi.advanceTimersByTime(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledExactlyOnceWith('blob:download')
    expect(vi.getTimerCount()).toBe(0)
  })
})

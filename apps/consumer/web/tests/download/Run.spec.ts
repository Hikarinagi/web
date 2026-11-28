import { DEFAULT_LOCALE, SHARED_MESSAGES } from '@hikarinagi/shared'
import { mount } from '@vue/test-utils'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import Run from '../../app/components/download/Run.vue'
import type { DownloadFailure, RunSnapshot } from '../../app/features/download/engine/types'
import messages from '../../i18n/locales/zh-CN'

const SERVER_DEFAULT = SHARED_MESSAGES[DEFAULT_LOCALE].bizCode.DOWNLOAD_DAILY_LIMITED
const LOCAL_TEXT = '本地语言包：今日下载额度已用完'

function failureText(error: DownloadFailure) {
  const run: RunSnapshot = {
    taskId: 1,
    title: '作品',
    sink: 'memory',
    state: 'error',
    files: [{ index: 0, name: '作品.cbz', bytes: 10, written: 0, state: 'error' }],
    written: 0,
    total: 10,
    speed: 0,
    error,
    location: null,
    mime: 'application/vnd.comicbook+zip',
  }
  const wrapper = mount(Run, { props: { run } })
  const text = wrapper.text()
  wrapper.unmount()
  return text
}

describe('DownloadRun failure', () => {
  beforeAll(() => {
    useNuxtApp().$i18n.setLocaleMessage('zh-CN', {
      ...messages,
      bizCode: { ...messages.bizCode, DOWNLOAD_DAILY_LIMITED: LOCAL_TEXT },
    })
  })

  afterAll(() => {
    useNuxtApp().$i18n.setLocaleMessage('zh-CN', messages)
  })

  it('shows the local text when the backend sent the default message of the code', () => {
    const text = failureText({ code: 'DOWNLOAD_DAILY_LIMITED', message: SERVER_DEFAULT, file: 0 })
    expect(text).toContain(LOCAL_TEXT)
    expect(text).not.toContain(SERVER_DEFAULT)
  })

  it('shows the backend text when a call site overrode the default message', () => {
    const text = failureText({
      code: 'DOWNLOAD_DAILY_LIMITED',
      message: '本周的下载额度已用完',
      file: 0,
    })
    expect(text).toContain('本周的下载额度已用完')
    expect(text).not.toContain(LOCAL_TEXT)
  })

  it('shows the local text of a business code the engine raised without a message', () => {
    expect(failureText({ code: 'DOWNLOAD_CONTENT_CHANGED', message: '', file: 0 })).toContain(
      '内容已更新，请重新获取下载清单',
    )
  })

  it('names the HTTP status of a failed response that is not JSON', () => {
    const text = failureText({
      code: 'HTTP_413',
      message: '',
      fallback: 'status',
      status: 413,
      file: 0,
    })
    expect(text).toContain('请求失败（HTTP 413）。')
    expect(text).not.toContain('网络连接中断')
  })

  it.each([
    ['network', '网络连接中断，请稍后继续。'],
    ['challenge', '需要完成安全验证，请刷新页面后继续。'],
    ['integrity', '文件校验失败，请重新加载。'],
    ['outlet', '无法开始保存文件。'],
    ['unexpected', '保存失败，请稍后继续。'],
  ] as const)('shows the local text for the %s fallback', (fallback, text) => {
    expect(failureText({ code: 'CLIENT', message: '', fallback, file: 0 })).toContain(text)
  })
})

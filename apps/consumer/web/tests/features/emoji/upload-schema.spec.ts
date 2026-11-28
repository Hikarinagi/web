import { describe, expect, it } from 'vitest'
import * as v from 'valibot'
import { emojiUploadSchema } from '~/features/emoji/schemas/emoji-upload.schema'

const messages = (input: unknown) =>
  (v.safeParse(emojiUploadSchema, input).issues ?? []).map(issue => issue.message)

describe('emojiUploadSchema', () => {
  it('fills the size limit in kilobytes into the language pack message', () => {
    const file = new File([new Uint8Array(512 * 1024 + 1)], 'big.png', { type: 'image/png' })
    expect(messages({ file, name: 'hina' })).toEqual(['文件大小不能超过 512 KB'])
  })

  it('reports an unsupported type and a malformed name', () => {
    const file = new File(['x'], 'a.bmp', { type: 'image/bmp' })
    expect(messages({ file, name: 'a b' })).toEqual([
      '仅支持 WebP / PNG / JPEG / GIF',
      '贴纸名称必须为 1-32 个字母/数字/下划线/连字符',
    ])
  })
})

import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'
import { EMOJI_MAX_FILE_BYTES, EMOJI_NAME_REGEX } from '../constants'

const ALLOWED_MIME = ['image/webp', 'image/png', 'image/jpeg', 'image/gif']

const fileField = v.pipe(
  v.instance(File, '请选择图片文件'),
  v.check(f => ALLOWED_MIME.includes(f.type), '仅支持 WebP / PNG / JPEG / GIF'),
  v.check(
    f => f.size <= EMOJI_MAX_FILE_BYTES,
    `文件大小不能超过 ${Math.round(EMOJI_MAX_FILE_BYTES / 1024)} KB`,
  ),
)

const nameField = v.pipe(
  v.string('请输入贴纸名称'),
  v.trim(),
  v.nonEmpty('请输入贴纸名称'),
  v.regex(EMOJI_NAME_REGEX, '贴纸名称必须为 1-32 个字母/数字/下划线/连字符'),
)

export const emojiUploadSchema = v.object({ file: fileField, name: nameField })
export type EmojiUploadValues = v.InferOutput<typeof emojiUploadSchema>
export const emojiUploadResolver = valibotResolver(emojiUploadSchema)

export const emojiReplaceImageSchema = v.object({ file: fileField })
export type EmojiReplaceImageValues = v.InferOutput<typeof emojiReplaceImageSchema>
export const emojiReplaceImageResolver = valibotResolver(emojiReplaceImageSchema)

import * as v from 'valibot'
import { EMOJI_MAX_FILE_BYTES, EMOJI_NAME_REGEX } from '../constants'

const ALLOWED_MIME = ['image/webp', 'image/png', 'image/jpeg', 'image/gif']

const fileField = v.pipe(
  v.instance(File, issueMessage('validation.emoji.fileRequired')),
  v.check(f => ALLOWED_MIME.includes(f.type), issueMessage('validation.emoji.fileType')),
  v.check(
    f => f.size <= EMOJI_MAX_FILE_BYTES,
    issueMessage('validation.emoji.fileSize', { size: Math.round(EMOJI_MAX_FILE_BYTES / 1024) }),
  ),
)

const nameField = v.pipe(
  v.string(issueMessage('validation.emoji.nameRequired')),
  v.trim(),
  v.nonEmpty(issueMessage('validation.emoji.nameRequired')),
  v.regex(EMOJI_NAME_REGEX, issueMessage('validation.emoji.nameFormat')),
)

export const emojiUploadSchema = v.object({ file: fileField, name: nameField })
export type EmojiUploadValues = v.InferOutput<typeof emojiUploadSchema>

export const emojiReplaceImageSchema = v.object({ file: fileField })
export type EmojiReplaceImageValues = v.InferOutput<typeof emojiReplaceImageSchema>

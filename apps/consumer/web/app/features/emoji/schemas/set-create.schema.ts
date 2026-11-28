import * as v from 'valibot'
import { EMOJI_SET_NAME_REGEX } from '../constants'

export const setCreateSchema = v.object({
  name: v.pipe(
    v.string(issueMessage('validation.emoji.setNameRequired')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.emoji.setNameRequired')),
    v.regex(EMOJI_SET_NAME_REGEX, issueMessage('validation.emoji.setNameFormat')),
  ),
  visibility: v.picklist(
    ['PUBLIC', 'PRIVATE'],
    issueMessage('validation.emoji.visibilityRequired'),
  ),
})
export type SetCreateValues = v.InferOutput<typeof setCreateSchema>

import * as v from 'valibot'

export const profileSchema = v.object({
  nickname: v.pipe(
    v.nullish(v.string(issueMessage('validation.space.nicknameType')), ''),
    v.trim(),
    v.maxLength(32, issueMessage('validation.space.nicknameMax')),
  ),
  signature: v.pipe(
    v.nullish(v.string(issueMessage('validation.space.signatureType')), ''),
    v.trim(),
    v.maxLength(120, issueMessage('validation.space.signatureMax')),
  ),
  bio: v.pipe(
    v.nullish(v.string(issueMessage('validation.space.bioType')), ''),
    v.trim(),
    v.maxLength(500, issueMessage('validation.space.bioMax')),
  ),
})
export type ProfileValues = v.InferOutput<typeof profileSchema>

export const nicknameSchema = v.object({
  nickname: v.pipe(
    v.string(issueMessage('validation.space.nicknameType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.space.nicknameRequired')),
    v.maxLength(32, issueMessage('validation.space.nicknameMax')),
  ),
})
export type NicknameValues = v.InferOutput<typeof nicknameSchema>

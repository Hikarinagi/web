import * as v from 'valibot'

const URL_PATTERN = /^(https?:\/\/|\/)/i

export const linkSchema = v.object({
  url: v.pipe(
    v.string(issueMessage('validation.editor.link.urlType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.editor.link.urlRequired')),
    v.check(value => URL_PATTERN.test(value), issueMessage('validation.editor.link.urlFormat')),
  ),
  text: v.pipe(v.nullish(v.string(issueMessage('validation.editor.link.textType')), ''), v.trim()),
})

export type LinkValues = v.InferOutput<typeof linkSchema>

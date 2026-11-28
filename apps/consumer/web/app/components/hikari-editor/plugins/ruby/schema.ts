import * as v from 'valibot'

export const rubySchema = v.object({
  reading: v.pipe(
    v.string(issueMessage('validation.editor.ruby.readingType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.editor.ruby.readingRequired')),
    v.maxLength(50, issueMessage('validation.editor.ruby.readingMax')),
    v.check(
      value => !/[｜《》\n]/.test(value),
      issueMessage('validation.editor.ruby.readingChars'),
    ),
  ),
})

export type RubyValues = v.InferOutput<typeof rubySchema>

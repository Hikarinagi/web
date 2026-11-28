import * as v from 'valibot'

export const saveSchema = v.object({
  note: v.pipe(
    v.nullish(v.string(issueMessage('validation.wiki.noteType')), ''),
    v.trim(),
    v.maxLength(500, issueMessage('validation.wiki.noteMax')),
  ),
  url: v.pipe(
    v.nullish(v.string(issueMessage('validation.wiki.urlType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.wiki.urlMax')),
    v.check(
      value => !value || /^https?:\/\//i.test(value),
      issueMessage('validation.wiki.urlProtocol'),
    ),
  ),
})

export type SaveValues = v.InferOutput<typeof saveSchema>

export const evidenceSchema = v.record(
  v.string(issueMessage('validation.wiki.evidenceType')),
  v.object({
    reason: v.picklist(
      ['CONTRADICTED', 'WRONG_ENTRY', 'DELETED'],
      issueMessage('validation.wiki.evidenceReason'),
    ),
    url: v.pipe(
      v.string(issueMessage('validation.wiki.urlType')),
      v.trim(),
      v.nonEmpty(issueMessage('validation.wiki.urlRequired')),
      v.maxLength(2000, issueMessage('validation.wiki.urlMax')),
      v.check(
        value => !value || /^https?:\/\//i.test(value),
        issueMessage('validation.wiki.urlProtocol'),
      ),
    ),
    excerpt: v.pipe(
      v.string(issueMessage('validation.wiki.excerptType')),
      v.trim(),
      v.nonEmpty(issueMessage('validation.wiki.excerptRequired')),
      v.maxLength(5000, issueMessage('validation.wiki.excerptMax')),
    ),
  }),
)

export type EvidenceValues = v.InferOutput<typeof evidenceSchema>

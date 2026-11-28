import * as v from 'valibot'

export const collectionSchema = v.object({
  name: v.pipe(
    v.string(issueMessage('validation.favorite.nameType')),
    v.trim(),
    v.nonEmpty(issueMessage('validation.favorite.nameRequired')),
    v.maxLength(255, issueMessage('validation.favorite.nameMax')),
  ),
  description: v.pipe(
    v.nullish(v.string(issueMessage('validation.favorite.descriptionType')), ''),
    v.trim(),
    v.maxLength(2000, issueMessage('validation.favorite.descriptionMax')),
  ),
  is_private: v.nullish(v.boolean(issueMessage('validation.favorite.privateType')), false),
})

export type CollectionValues = v.InferOutput<typeof collectionSchema>

import * as v from 'valibot'

export const deprecateSchema = v.pipe(
  v.object({
    reason: v.picklist(['CONTRADICTED', 'WRONG_ENTRY', 'DUPLICATE'], '请选择原因'),
    source: v.pipe(v.nullish(v.string('来源应为文本'), ''), v.trim()),
    excerpt: v.pipe(v.nullish(v.string('摘录应为文本'), ''), v.trim()),
    note: v.pipe(v.nullish(v.string('补充说明应为文本'), ''), v.trim()),
  }),
  v.forward(
    v.check(
      value => value.reason !== 'CONTRADICTED' || Boolean(value.source),
      '请附上与该值相矛盾的来源',
    ),
    ['source'],
  ),
  v.forward(
    v.check(
      value => value.reason === 'CONTRADICTED' || Boolean(value.note),
      '请说明该值作废的原因',
    ),
    ['note'],
  ),
)

export type DeprecateValues = v.InferOutput<typeof deprecateSchema>

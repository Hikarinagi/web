import * as v from 'valibot'

const optional = (label: string) => v.pipe(v.nullish(v.string(`${label}应为文本`), ''), v.trim())
const day = (label: string) =>
  v.pipe(
    optional(label),
    v.check(
      value => !value || /^\d{4}(-\d{2}(-\d{2})?)?$/.test(value),
      '日期应写作 2012、2012-10 或 2012-10-26',
    ),
  )

export const statementSchema = v.object({
  text: optional('值'),
  code: optional('取值'),
  date: day('日期'),
  amount: v.pipe(
    optional('金额'),
    v.check(value => !value || /^\d+(\.\d{1,2})?$/.test(value), '金额应为数字'),
  ),
  currency: optional('币种'),
  tax: v.picklist(['included', 'excluded', 'unknown'], '请选择是否含税'),
  method: v.picklist(['link', 'screenshot'], '请选择来源的类型'),
  source: optional('来源'),
  excerpt: optional('摘录'),
  version: v.nullish(v.number('所选版本无效'), null),
  location: optional('作品中的位置'),
  note: optional('补充说明'),
  target: v.nullish(v.number('所选条目无效'), null),
  reading: optional('读音'),
  song: optional('歌名'),
  song_kind: optional('主题歌或插入歌'),
  part: optional('适用部分'),
  period_from: day('起始日期'),
  period_to: day('截止日期'),
})

export type StatementValues = v.InferOutput<typeof statementSchema>

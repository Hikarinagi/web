import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

import { EXTERNAL_LINK_TYPE_LABELS } from '../labels'

const pairRow = (keyLabel: string, valueLabel: string) =>
  v.object({
    key: v.pipe(v.string(`${keyLabel}应为文本`), v.trim(), v.maxLength(60, `${keyLabel}过长`)),
    value: v.pipe(
      v.string(`${valueLabel}应为文本`),
      v.trim(),
      v.maxLength(200, `${valueLabel}过长`),
    ),
  })

const pairsComplete = (rows: { key: string; value: string }[]) =>
  rows.every(row => row.key.trim().length > 0 && row.value.trim().length > 0)

export const galgameMerchSchema = v.object({
  name: v.pipe(
    v.string('名称应为文本'),
    v.trim(),
    v.nonEmpty('请填写制品名称'),
    v.maxLength(80, '名称不能超过 80 字'),
  ),
  image_id: v.nullish(v.number('图片应为数字'), null),
  category: v.pipe(
    v.nullish(v.string('定位应为文本'), ''),
    v.trim(),
    v.maxLength(30, '定位不能超过 30 字'),
  ),
  description: v.pipe(
    v.nullish(v.string('描述应为文本'), ''),
    v.trim(),
    v.maxLength(500, '描述不能超过 500 字'),
  ),
  labels: v.pipe(
    v.nullish(v.array(pairRow('键名', '内容')), []),
    v.check(pairsComplete, '请补全每条其他信息的键与内容'),
  ),
  staffs: v.pipe(
    v.nullish(v.array(pairRow('职责', '名称')), []),
    v.check(pairsComplete, '请补全每条制作信息的职责与名称'),
  ),
})

export type GalgameMerchValues = v.InferOutput<typeof galgameMerchSchema>
export const galgameMerchResolver = valibotResolver(galgameMerchSchema)

export const galgameExternalLinkSchema = v.object({
  type: v.picklist(
    Object.keys(EXTERNAL_LINK_TYPE_LABELS) as ['WEBSITE', 'TWITTER', 'BLOG', 'WIKI', 'OTHER'],
    '请选择类型',
  ),
  name: v.pipe(
    v.string('名称应为文本'),
    v.trim(),
    v.nonEmpty('请填写名称'),
    v.maxLength(60, '名称不能超过 60 字'),
  ),
  url: v.pipe(
    v.string('链接应为文本'),
    v.trim(),
    v.nonEmpty('请填写链接'),
    v.maxLength(500, '链接不能超过 500 字'),
    v.check(value => /^https?:\/\//i.test(value), '链接需以 http:// 或 https:// 开头'),
  ),
})

export type GalgameExternalLinkValues = v.InferOutput<typeof galgameExternalLinkSchema>
export const galgameExternalLinkResolver = valibotResolver(galgameExternalLinkSchema)

import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

const dimension = v.nullish(
  v.pipe(
    v.number('维度评分应为数字'),
    v.integer('维度评分需为整数'),
    v.minValue(1, '维度评分需 1-10'),
    v.maxValue(10, '维度评分需 1-10'),
  ),
  null,
)

export const galgameRateSchema = v.object({
  status: v.picklist(['GOING', 'COMPLETED', 'ON_HOLD', 'DROPPED'], '选个状态'),
  rate: v.pipe(
    v.number('给个总分'),
    v.integer('请打整数分'),
    v.minValue(1, '总分需 1-10'),
    v.maxValue(10, '总分需 1-10'),
  ),
  rate_content: v.pipe(
    v.nullish(v.string('短评应为文本'), ''),
    v.trim(),
    v.maxLength(2000, '短评不能超过 2000 字'),
  ),
  time_to_finish_hours: v.nullish(
    v.pipe(v.number('时长应为数字'), v.minValue(0, '时长不能为负'), v.maxValue(9999, '时长过大')),
    null,
  ),
  is_spoiler: v.optional(v.boolean(), false),
  rate_scenario: dimension,
  rate_direction: dimension,
  rate_music: dimension,
  rate_visual: dimension,
  rate_character: dimension,
  rate_system: dimension,
})

export type GalgameRateValues = v.InferOutput<typeof galgameRateSchema>
export const galgameRateResolver = valibotResolver(galgameRateSchema)

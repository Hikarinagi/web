import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const mangaRateSchema = v.object({
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
  is_spoiler: v.optional(v.boolean(), false),
})

export type MangaRateValues = v.InferOutput<typeof mangaRateSchema>
export const mangaRateResolver = valibotResolver(mangaRateSchema)

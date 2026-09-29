import * as v from 'valibot'

export const rubySchema = v.object({
  reading: v.pipe(
    v.string('读音应为文本'),
    v.trim(),
    v.nonEmpty('请输入读音'),
    v.maxLength(50, '读音不能超过 50 字'),
    v.check(value => !/[｜《》\n]/.test(value), '读音不能包含｜《》或换行'),
  ),
})

export type RubyValues = v.InferOutput<typeof rubySchema>

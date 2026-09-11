import * as v from 'valibot'

const optionText = v.pipe(
  v.nullish(v.string('选项应为文本'), ''),
  v.trim(),
  v.maxLength(80, '选项最多 80 个字'),
)

const shared = {
  question: v.pipe(
    v.string('问题应为文本'),
    v.trim(),
    v.nonEmpty('请填写问题'),
    v.maxLength(120, '问题最多 120 个字'),
  ),
  allow_multiple: v.boolean('允许多选应为布尔值'),
  max_choices: v.nullable(
    v.pipe(
      v.number('最多可选应为数字'),
      v.integer('最多可选必须是整数'),
      v.minValue(2, '最多可选不能少于 2'),
    ),
  ),
  is_public: v.boolean('公开投票人应为布尔值'),
  allow_change: v.boolean('允许修改投票应为布尔值'),
  closes_at: v.nullable(v.string('截止时间应为文本')),
}

export const pollSchema = v.object({
  ...shared,
  options: v.pipe(
    v.array(optionText, '选项应为列表'),
    v.check(items => items.filter(item => item.length > 0).length >= 2, '至少填写两个选项'),
  ),
})

export const pollLockedSchema = v.object({
  ...shared,
  options: v.array(optionText, '选项应为列表'),
})

export type PollValues = v.InferOutput<typeof pollSchema>

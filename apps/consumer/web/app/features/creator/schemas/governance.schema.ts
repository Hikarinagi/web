import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const permissionGroupSchema = v.object({
  name: v.pipe(
    v.string('请输入名称'),
    v.trim(),
    v.nonEmpty('请输入名称'),
    v.maxLength(100, '名称不能超过 100 字符'),
  ),
  description: v.pipe(
    v.nullish(v.string('描述应为文本'), ''),
    v.trim(),
    v.maxLength(500, '描述不能超过 500 字符'),
  ),
  permissions: v.pipe(v.array(v.string()), v.minLength(1, '至少勾选一项权限'), v.maxLength(200)),
})
export type PermissionGroupValues = v.InferOutput<typeof permissionGroupSchema>
export const permissionGroupResolver = valibotResolver(permissionGroupSchema)

export const addPermissionGroupMemberSchema = v.object({
  user_id: v.pipe(
    v.number('请输入用户 ID'),
    v.integer('用户 ID 必须为整数'),
    v.minValue(1, '用户 ID 必须大于 0'),
  ),
})
export type AddPermissionGroupMemberValues = v.InferOutput<typeof addPermissionGroupMemberSchema>
export const addPermissionGroupMemberResolver = valibotResolver(addPermissionGroupMemberSchema)

export const rejectReviewGroupApplicationSchema = v.object({
  rejection_reason: v.pipe(
    v.string('请输入驳回理由'),
    v.trim(),
    v.nonEmpty('请输入驳回理由'),
    v.maxLength(500),
  ),
})
export type RejectReviewGroupApplicationValues = v.InferOutput<
  typeof rejectReviewGroupApplicationSchema
>
export const rejectReviewGroupApplicationResolver = valibotResolver(
  rejectReviewGroupApplicationSchema,
)

export const applyReviewGroupSchema = v.object({
  permission_group_id: v.pipe(v.number('请选择审核组'), v.integer(), v.minValue(1, '请选择审核组')),
  reason: v.pipe(
    v.string('请输入申请理由'),
    v.trim(),
    v.nonEmpty('请输入申请理由'),
    v.maxLength(500, '理由不能超过 500 字符'),
  ),
  homepage: v.pipe(
    v.nullish(v.string('个人主页应为文本'), ''),
    v.trim(),
    v.check(
      value => !value || /^https?:\/\/.+/i.test(value),
      '请输入以 http:// 或 https:// 开头的链接',
    ),
    v.maxLength(2048, '链接不能超过 2048 字符'),
  ),
  images: v.optional(v.pipe(v.array(v.number()), v.maxLength(20))),
})
export type ApplyReviewGroupValues = v.InferOutput<typeof applyReviewGroupSchema>
export const applyReviewGroupResolver = valibotResolver(applyReviewGroupSchema)

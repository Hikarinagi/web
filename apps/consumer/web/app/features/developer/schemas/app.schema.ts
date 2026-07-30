import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const developerAppSchema = v.object({
  client_name: v.pipe(
    v.string('请输入应用名称'),
    v.trim(),
    v.nonEmpty('请输入应用名称'),
    v.maxLength(64, '名称不能超过 64 字符'),
  ),
})
export type DeveloperAppValues = v.InferOutput<typeof developerAppSchema>
export const developerAppResolver = valibotResolver(developerAppSchema)

export const developerAppProfileSchema = v.object({
  client_name: v.pipe(
    v.string('请输入应用名称'),
    v.trim(),
    v.nonEmpty('请输入应用名称'),
    v.maxLength(64, '名称不能超过 64 字符'),
  ),
  client_uri: v.pipe(
    v.nullish(v.string('主页地址应为文本'), ''),
    v.trim(),
    v.check(
      value => !value || /^https:\/\/[^#\s]+$/i.test(value),
      '请输入合法的 https:// 地址（不含 #fragment）',
    ),
  ),
})
export type DeveloperAppProfileValues = v.InferOutput<typeof developerAppProfileSchema>
export const developerAppProfileResolver = valibotResolver(developerAppProfileSchema)

export const developerAppRedirectSchema = v.object({
  uri: v.pipe(
    v.string('请输入回调地址'),
    v.trim(),
    v.nonEmpty('请输入回调地址'),
    v.check(
      value => /^https:\/\/[^#\s]+$|^http:\/\/localhost(:\d+)?(\/[^#\s]*)?$/i.test(value),
      '必须是合法的 https:// 地址且不含 #fragment（本地调试可用 http://localhost）',
    ),
  ),
})
export type DeveloperAppRedirectValues = v.InferOutput<typeof developerAppRedirectSchema>
export const developerAppRedirectResolver = valibotResolver(developerAppRedirectSchema)

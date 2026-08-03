import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import * as v from 'valibot'

export const developerAppSchema = v.object({
  client_name: v.pipe(
    v.string('请输入应用名称'),
    v.trim(),
    v.nonEmpty('请输入应用名称'),
    v.maxLength(64, '名称不能超过 64 字符'),
  ),
  form: v.picklist(['server', 'spa', 'native'], '请选择应用形态'),
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
    v.check(value => !value.includes('#'), '回调地址不能包含 #fragment'),
    v.check(value => /^[a-z][a-z0-9+.-]*:/i.test(value), '回调地址必须包含协议'),
  ),
})
export type DeveloperAppRedirectValues = v.InferOutput<typeof developerAppRedirectSchema>
export const developerAppRedirectResolver = valibotResolver(developerAppRedirectSchema)

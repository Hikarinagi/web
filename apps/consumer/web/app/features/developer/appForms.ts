export type DeveloperClientType = 'confidential' | 'public'
export type DeveloperApplicationType = 'web' | 'native'

export interface DeveloperAppForm {
  value: 'server' | 'spa' | 'native'
  label: string
  hint: string
  redirect: string
  client_type: DeveloperClientType
  application_type: DeveloperApplicationType
}

export const DEVELOPER_APP_FORMS: DeveloperAppForm[] = [
  {
    value: 'server',
    label: '服务端应用',
    hint: '网站后端、bot、脚本、数据同步任务。可安全保存密钥，支持以密钥换取应用级令牌。',
    redirect: '回调地址需为 https://，本地调试可用环回地址',
    client_type: 'confidential',
    application_type: 'web',
  },
  {
    value: 'spa',
    label: '单页应用',
    hint: '运行在浏览器中的前端应用。不持有密钥，仅支持 PKCE 授权码流程。',
    redirect: '回调地址需为 https://，本地调试可用环回地址',
    client_type: 'public',
    application_type: 'web',
  },
  {
    value: 'native',
    label: '原生应用',
    hint: '移动端、桌面端或命令行工具。不持有密钥，仅支持 PKCE 授权码流程。',
    redirect: '回调地址可用私有 scheme 或环回地址',
    client_type: 'public',
    application_type: 'native',
  },
]

export const DEVELOPER_AUTH_METHODS = [
  {
    value: 'client_secret_basic',
    label: 'client_secret_basic',
    hint: '凭据放在 Authorization 请求头（HTTP Basic）',
  },
  {
    value: 'client_secret_post',
    label: 'client_secret_post',
    hint: '凭据放在请求体表单参数中',
  },
]

export function appFormValue(
  clientType: string,
  applicationType: string,
): DeveloperAppForm['value'] {
  if (applicationType === 'native') return 'native'
  return clientType === 'public' ? 'spa' : 'server'
}

export function appFormOf(value: string): DeveloperAppForm {
  return (
    DEVELOPER_APP_FORMS.find(form => form.value === value) ??
    (DEVELOPER_APP_FORMS[0] as DeveloperAppForm)
  )
}

export interface GuideSection {
  id: string
  title: string
}

export const GUIDE_SECTIONS: GuideSection[] = [
  { id: 'auth', title: '鉴权' },
  { id: 'app-flow', title: '应用级令牌' },
  { id: 'user-flow', title: '用户级令牌' },
  { id: 'scopes', title: '权限范围' },
  { id: 'tokens', title: '令牌生命周期' },
  { id: 'conventions', title: '响应约定' },
]

export interface ParamRow {
  name: string
  requirement: string
  detail: string
}

export const OIDC_LIBRARIES = [
  { platform: '服务端 Node', library: 'openid-client' },
  { platform: '浏览器 SPA', library: 'oidc-client-ts' },
  { platform: 'iOS / Android', library: 'AppAuth' },
  { platform: 'Go', library: 'coreos/go-oidc' },
]

export const AUTHORIZE_PARAMS: ParamRow[] = [
  { name: 'response_type', requirement: '必填', detail: '固定为 code，不支持隐式流' },
  { name: 'client_id', requirement: '必填', detail: '控制台中该应用的 client_id' },
  {
    name: 'redirect_uri',
    requirement: '必填',
    detail: '必须与控制台登记的某一条完全一致，包括协议、端口、路径与结尾斜杠，不做前缀匹配',
  },
  {
    name: 'scope',
    requirement: '必填',
    detail:
      '空格分隔。openid 表示同时签发 ID token；offline_access 需与 prompt=consent 同时出现才会签发 refresh token；其余见「权限范围」，且不得超出控制台已勾选的集合',
  },
  {
    name: 'prompt',
    requirement: '申请 offline_access 时必填',
    detail:
      '取 consent。按 OIDC 规范，prompt 不含 consent 时 offline_access 会被静默忽略，授权仍然成功但不会签发 refresh token',
  },
  { name: 'state', requirement: '必填', detail: '随机值，回调时原样返回，须逐字比对后再继续' },
  {
    name: 'nonce',
    requirement: '申请 openid 时建议',
    detail: '随机值，原样写入所签发 ID token 的 nonce 声明',
  },
  {
    name: 'code_challenge',
    requirement: '必填',
    detail: 'code_verifier 的 SHA-256 摘要，base64url 编码',
  },
  { name: 'code_challenge_method', requirement: '必填', detail: '固定为 S256，不接受 plain' },
]

export const CALLBACK_PARAMS: ParamRow[] = [
  { name: 'code', requirement: '成功时返回', detail: '授权码，仅可使用一次，有效期 60 秒' },
  { name: 'state', requirement: '总是返回', detail: '原样回传授权请求中发出的值' },
  {
    name: 'error',
    requirement: '失败时返回',
    detail: 'access_denied 表示用户拒绝授权；invalid_scope 表示申请了应用未获授权的 scope',
  },
  { name: 'error_description', requirement: '失败时可能返回', detail: '可读的失败原因，仅供排错' },
]

export const TOKEN_PARAMS: ParamRow[] = [
  { name: 'grant_type', requirement: '必填', detail: '固定为 authorization_code' },
  { name: 'code', requirement: '必填', detail: '回调中拿到的授权码' },
  {
    name: 'redirect_uri',
    requirement: '必填',
    detail: '必须与授权请求中使用的那一条完全一致，否则换取失败',
  },
  { name: 'code_verifier', requirement: '必填', detail: '第一步生成的原始随机串，而非其摘要' },
  {
    name: 'client_id',
    requirement: '公共客户端必填',
    detail: '机密客户端不在此处传递，改由所登记的客户端认证方式携带',
  },
]

export interface OpenErrorRow {
  status: number
  code: string
  when: string
}

export const OPEN_ERRORS: OpenErrorRow[] = [
  {
    status: 401,
    code: 'AUTH_UNAUTHENTICATED',
    when: '缺少 Authorization 请求头，或该端点要求令牌代表某个用户而所用令牌只代表应用自身',
  },
  {
    status: 401,
    code: 'AUTH_TOKEN_INVALID',
    when: '令牌的签名、签发方或受众不匹配，或令牌已过期、已被撤销',
  },
  { status: 403, code: 'AUTH_FORBIDDEN', when: '令牌有效，但缺少该端点要求的 scope' },
  { status: 403, code: 'USER_BANNED', when: '授权用户的账号已被封禁或停用' },
  {
    status: 404,
    code: 'COMMON_NOT_FOUND',
    when: '资源不存在、未发布，或不在当前 scope 的可见范围内',
  },
  {
    status: 422,
    code: 'COMMON_VALIDATION_FAILED',
    when: '请求体或查询参数未通过校验，field_errors 中给出逐字段原因',
  },
  { status: 429, code: 'COMMON_RATE_LIMITED', when: '超出该应用的调用频率上限' },
]

export interface RateLimitHeaderRow {
  name: string
  when: string
}

export const RATE_LIMIT_HEADERS: RateLimitHeaderRow[] = [
  { name: 'X-RateLimit-Limit', when: '当前窗口的调用上限，即该应用的配额' },
  { name: 'X-RateLimit-Remaining', when: '当前窗口内剩余的调用次数，触发限流后为 0' },
  { name: 'X-RateLimit-Reset', when: '距当前窗口重置的秒数' },
  { name: 'Retry-After', when: '仅 429 响应携带，恢复调用前需等待的秒数' },
]

export interface HikariThirdPartyProvider {
  name: string
  allowed_hosts: string[]
}

// 第三方图源的单一真源。前端路由白名单(HIKARI_THIRD_PARTY_PROVIDER_PATHS)与图片处理器的
// THIRD_PARTY_PROVIDERS_JSON 都从这里派生,避免两份配置漂移。新增图源只改这个列表。
// 处理器在仓库外、由 env 配置,把它的 THIRD_PARTY_PROVIDERS_JSON 设为 HIKARI_THIRD_PARTY_PROVIDERS_JSON 即可对齐。
export const HIKARI_THIRD_PARTY_PROVIDERS: readonly HikariThirdPartyProvider[] = [
  { name: 'bangumi', allowed_hosts: ['lain.bgm.tv'] },
  { name: 'shionlib', allowed_hosts: ['t.shionlib.com'] },
  { name: 'vndb', allowed_hosts: ['t.vndb.org'] },
]

// host → provider name(前端 resolveImageUrl 据此判断能否走处理器)
export const HIKARI_THIRD_PARTY_PROVIDER_PATHS: Readonly<Record<string, string>> =
  Object.fromEntries(
    HIKARI_THIRD_PARTY_PROVIDERS.flatMap(provider =>
      provider.allowed_hosts.map(host => [host, provider.name] as const),
    ),
  )

// 图片处理器 env THIRD_PARTY_PROVIDERS_JSON 应取此值(同一真源生成,保证两边一致)。
export const HIKARI_THIRD_PARTY_PROVIDERS_JSON = JSON.stringify(HIKARI_THIRD_PARTY_PROVIDERS)

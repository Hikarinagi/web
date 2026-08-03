<script setup lang="ts">
  import type { DevelopersDocsPageData } from '~~/server/api/pages/developers/docs.get'
  import {
    AUTHORIZE_PARAMS,
    CALLBACK_PARAMS,
    OIDC_LIBRARIES,
    TOKEN_PARAMS,
  } from '~/features/developer/guide'

  defineOptions({ name: 'DeveloperGuideUserFlow' })
  defineProps<{ guide: DevelopersDocsPageData }>()
</script>

<template>
  <section
    id="user-flow"
    class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-5"
  >
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-bold text-color">用户级令牌</h2>
      <p class="text-sm leading-relaxed text-muted-color">
        Hikarinagi ID 通过 OpenID Connect 授权码流程签发用户级令牌，PKCE
        为必填项。应用须先在控制台配置回调地址，配置后方可开通授权码流程并勾选用户级 scope。
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">使用标准客户端库</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        Hikarinagi ID 为标准 OpenID Connect
        实现，未引入私有扩展。向客户端库提供下列发现文档地址，端点、支持的 scope
        与签名密钥即可自动获取。
      </p>
      <DeveloperCodeBlock :code="guide.discovery_endpoint" />
      <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
        <div
          v-for="item in OIDC_LIBRARIES"
          :key="item.platform"
          class="grid grid-cols-1 gap-1 py-2 sm:grid-cols-[minmax(0,12rem)_1fr] sm:gap-4"
        >
          <span class="text-sm text-color">{{ item.platform }}</span>
          <code class="font-mono text-xs text-muted-color">{{ item.library }}</code>
        </div>
      </div>
      <p class="text-sm leading-relaxed text-muted-color">
        以下为该流程的原始 HTTP 交互，供自行实现或排查时参照。
      </p>
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">1. 生成 PKCE 参数</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        Hikarinagi ID 仅接受
        <code class="font-mono">S256</code>
        ，不接受
        <code class="font-mono">plain</code>
        。
      </p>
      <DeveloperCodeBlock :code="guide.snippets.pkce.code" :html="guide.snippets.pkce.html" />
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">2. 发起授权请求</h3>
      <p class="text-sm leading-relaxed text-muted-color">由浏览器导航至授权端点。</p>
      <DeveloperCodeBlock
        :code="guide.snippets.authorize.code"
        :html="guide.snippets.authorize.html"
      />
      <DeveloperGuideParamTable :rows="AUTHORIZE_PARAMS" />
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">3. 接收授权响应</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        用户在同意屏作出决策后，Hikarinagi ID 将响应参数附于
        <code class="font-mono">redirect_uri</code>
        的查询串返回。
      </p>
      <DeveloperGuideParamTable :rows="CALLBACK_PARAMS" />
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">4. 发起令牌请求</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        客户端认证方式须与控制台登记值一致，其余方式将被拒绝。机密客户端默认为
        <code class="font-mono">client_secret_basic</code>
        ：
      </p>
      <DeveloperCodeBlock
        :code="guide.snippets.basic_exchange.code"
        :html="guide.snippets.basic_exchange.html"
      />
      <p class="text-sm text-muted-color">
        登记为
        <code class="font-mono">client_secret_post</code>
        时，凭据改由表单参数传递：
      </p>
      <DeveloperCodeBlock
        :code="guide.snippets.post_exchange.code"
        :html="guide.snippets.post_exchange.html"
      />
      <p class="text-sm text-muted-color">公共客户端不持有密钥，仅传递 client_id：</p>
      <DeveloperCodeBlock
        :code="guide.snippets.public_exchange.code"
        :html="guide.snippets.public_exchange.html"
      />
      <DeveloperGuideParamTable :rows="TOKEN_PARAMS" />
      <DeveloperCodeBlock
        :code="guide.snippets.token_response.code"
        :html="guide.snippets.token_response.html"
      />
    </div>

    <div class="flex flex-col gap-3">
      <h3 class="text-base font-semibold text-color">5. 访问受保护资源</h3>
      <p class="text-sm leading-relaxed text-muted-color">
        以
        <code class="font-mono">Authorization: Bearer</code>
        请求头携带访问令牌。相关端点统一位于
        <code class="font-mono">/open/user/me/**</code>
        之下，主体由令牌的
        <code class="font-mono">sub</code>
        声明确定，不接受在请求中指定用户。
      </p>
      <DeveloperCodeBlock
        :code="guide.snippets.user_call.code"
        :html="guide.snippets.user_call.html"
      />
    </div>
  </section>
</template>

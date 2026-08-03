<script setup lang="ts">
  import type { DevelopersDocsPageData } from '~~/server/api/pages/developers/docs.get'

  defineOptions({ name: 'DeveloperGuideTokens' })
  defineProps<{ guide: DevelopersDocsPageData }>()

  const FACTS = [
    { term: '访问令牌有效期', detail: '1 小时。访问令牌为自包含 JWT，无需调用内省端点即可验证。' },
    {
      term: '受众',
      detail:
        '开放平台令牌的 aud 固定为 Hikarinagi ID 的 open 受众，仅 /api/v3/open/** 接受该受众。',
    },
    {
      term: '刷新令牌',
      detail:
        '仅在申请了 offline_access 的用户级授权中签发，且每次刷新均会轮换。请以响应中返回的新值覆盖原有 refresh token。',
    },
    {
      term: '撤销',
      detail:
        '用户可在账号中心的「已授权应用」中随时取消授权，该应用名下的访问令牌与刷新令牌将立即失效。',
    },
  ]
</script>

<template>
  <section id="tokens" class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4">
    <h2 class="text-2xl font-bold text-color">令牌生命周期</h2>
    <p class="text-sm leading-relaxed text-muted-color">
      服务发现文档位于
      <code class="font-mono break-all">{{ guide.discovery_endpoint }}</code>
      ，可直接用于标准 OAuth / OIDC 客户端库的自动配置。
    </p>

    <dl class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div
        v-for="fact in FACTS"
        :key="fact.term"
        class="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4"
      >
        <dt class="text-sm font-medium text-color">{{ fact.term }}</dt>
        <dd class="text-sm leading-relaxed text-muted-color">{{ fact.detail }}</dd>
      </div>
    </dl>

    <h3 class="text-base font-semibold text-color">刷新令牌</h3>
    <DeveloperCodeBlock :code="guide.snippets.refresh.code" :html="guide.snippets.refresh.html" />

    <p class="text-sm leading-relaxed text-muted-color">
      401
      并不总是意味着令牌过期。用户撤销授权后刷新同样会失败，此时应引导用户重新完成授权流程，而非持续重试。
    </p>
  </section>
</template>

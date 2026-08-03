<script setup lang="ts">
  import type { DevelopersDocsPageData } from '~~/server/api/pages/developers/docs.get'

  defineOptions({ name: 'DeveloperGuideAppFlow' })
  defineProps<{ guide: DevelopersDocsPageData }>()
</script>

<template>
  <section
    id="app-flow"
    class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4"
  >
    <h2 class="text-2xl font-bold text-color">应用级令牌</h2>
    <p class="text-sm leading-relaxed text-muted-color">
      在
      <NuxtLink to="/developers/console" class="text-primary hover:text-primary-600">
        控制台
      </NuxtLink>
      创建应用并勾选
      <code class="font-mono">catalog:read</code>
      ，随后使用密钥换取令牌。请求的 scope 不得超出应用已获授权的范围，否则返回
      <code class="font-mono">invalid_scope</code>
      。
    </p>

    <DeveloperCodeBlock
      :code="guide.snippets.app_token.code"
      :html="guide.snippets.app_token.html"
    />
    <DeveloperCodeBlock :code="guide.snippets.app_call.code" :html="guide.snippets.app_call.html" />

    <p class="text-sm text-muted-color">
      访问令牌有效期为 1 小时，过期后重新换取。应用级令牌不签发 refresh token。
    </p>
  </section>
</template>

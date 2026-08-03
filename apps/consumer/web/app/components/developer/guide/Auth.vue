<script setup lang="ts">
  defineOptions({ name: 'DeveloperGuideAuth' })

  const MODES = [
    {
      token: '应用级',
      grant: 'client_credentials',
      subject: '应用自己',
      scopes: 'catalog:read、catalog:full',
    },
    {
      token: '用户级',
      grant: 'authorization_code + PKCE',
      subject: '同意授权的用户',
      scopes: 'user:read、status:read、status:write',
    },
  ]
</script>

<template>
  <section id="auth" class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4">
    <h2 class="text-2xl font-bold text-color">鉴权</h2>

    <table class="w-full text-left text-sm">
      <thead class="text-xs text-muted-color">
        <tr class="border-b border-surface">
          <th class="py-2 pr-4 font-normal">令牌</th>
          <th class="py-2 pr-4 font-normal">取法</th>
          <th class="py-2 pr-4 font-normal">代表</th>
          <th class="py-2 font-normal">scope</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="mode in MODES"
          :key="mode.token"
          class="border-b border-surface-100 dark:border-surface-800"
        >
          <td class="py-2.5 pr-4 font-medium text-color">{{ mode.token }}</td>
          <td class="py-2.5 pr-4 font-mono text-xs text-muted-color">{{ mode.grant }}</td>
          <td class="py-2.5 pr-4 text-muted-color">{{ mode.subject }}</td>
          <td class="py-2.5 font-mono text-xs text-muted-color">{{ mode.scopes }}</td>
        </tr>
      </tbody>
    </table>

    <ul class="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-color">
      <li>
        开放平台令牌仅可访问
        <code class="font-mono">/api/v3/open/**</code>
        ，用于其它接口将返回 401。
      </li>
      <li>
        客户端类型在控制台切换。机密客户端持有
        client_secret，可取得应用级令牌；公共客户端（SPA、移动端）不持有密钥，仅支持授权码流程。
      </li>
      <li>
        授权码流程强制启用 PKCE，未携带
        <code class="font-mono">code_challenge</code>
        的授权请求将被拒绝。
      </li>
    </ul>
  </section>
</template>

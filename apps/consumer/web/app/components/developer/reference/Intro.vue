<script setup lang="ts">
  defineOptions({ name: 'DeveloperReferenceIntro' })
  const props = defineProps<{ issuer: string }>()

  const tokenCurl = computed(() =>
    [
      `curl -X POST "${props.issuer}/token" \\`,
      '  -u "$CLIENT_ID:$CLIENT_SECRET" \\',
      '  -d "grant_type=client_credentials&scope=$SCOPES"',
    ].join('\n'),
  )

  const envelopeExample = [
    '{',
    '  "success": true,',
    '  "data": { … },',
    '  "request_id": "req-x",',
    '  "timestamp": "2026-07-10T00:00:00.000Z"',
    '}',
  ].join('\n')
</script>

<template>
  <header class="flex flex-col gap-6">
    <div class="flex flex-col gap-3">
      <h1 class="font-mono text-4xl font-extrabold tracking-tight text-color">
        Hikarinagi Public API
      </h1>
      <p class="text-muted-color">
        Hikarinagi 公开数据 API。所有端点要求携带 client_credentials 访问令牌，默认 throttle 60
        次/分钟/应用。
      </p>
    </div>

    <section class="flex flex-col gap-3">
      <h2 class="text-xl font-bold text-color">获取访问令牌</h2>
      <p class="text-sm text-muted-color">
        在
        <NuxtLink
          href="/developers/console"
          class="text-primary transition-colors hover:text-primary-600"
        >
          开发者控制台
        </NuxtLink>
        创建应用后，用 client_id 与 client_secret 通过 Basic 认证请求令牌，令牌有效期 1
        小时；scope 为本次申请的权限集合，不能超出应用已被授予的范围。
      </p>
      <DeveloperCodeBlock :code="tokenCurl" />
    </section>

    <section class="flex flex-col gap-3">
      <h2 class="text-xl font-bold text-color">响应格式</h2>
      <p class="text-sm text-muted-color">
        所有响应都包裹在统一信封中，文档里各端点描述的是信封内 data 字段的结构。
      </p>
      <DeveloperCodeBlock :code="envelopeExample" />
    </section>
  </header>
</template>

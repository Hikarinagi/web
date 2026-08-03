<script setup lang="ts">
  defineOptions({ name: 'DeveloperReferenceIntro' })
  defineProps<{ issuer: string }>()

  const TOKENS = [
    {
      variable: '$APP_TOKEN',
      title: '应用级令牌',
      detail: '由 client_credentials 换取，代表应用自身，用于条目数据端点。',
    },
    {
      variable: '$USER_TOKEN',
      title: '用户级令牌',
      detail: '由授权码流程换取，代表完成授权的用户，用于用户数据端点。',
    },
  ]
</script>

<template>
  <section
    id="reference"
    class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4"
  >
    <h2 class="text-2xl font-bold text-color">端点参考</h2>
    <p class="text-sm leading-relaxed text-muted-color">
      每个端点均标注所需 scope
      与响应状态码。两组端点要求的令牌类型不同，示例中的令牌变量名已相应区分。响应示例展示的是信封内
      <code class="font-mono">data</code>
      字段的内容，完整信封见
      <NuxtLink to="/developers/docs#conventions" class="text-primary hover:text-primary-600">
        响应约定
      </NuxtLink>
      。
    </p>

    <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div
        v-for="token in TOKENS"
        :key="token.variable"
        class="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-4"
      >
        <code class="font-mono text-sm break-words text-color">{{ token.variable }}</code>
        <div class="flex flex-col gap-0.5">
          <span class="text-sm text-color">{{ token.title }}</span>
          <span class="text-xs leading-relaxed text-muted-color">{{ token.detail }}</span>
        </div>
      </div>
    </div>

    <p class="text-xs text-muted-color">
      Hikarinagi ID issuer：
      <code class="font-mono break-all">{{ issuer }}</code>
    </p>
  </section>
</template>

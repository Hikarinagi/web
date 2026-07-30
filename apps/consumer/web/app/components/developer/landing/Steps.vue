<script setup lang="ts">
  defineOptions({ name: 'DeveloperLandingSteps' })

  const steps = [
    {
      number: '01',
      title: '创建应用',
      description:
        '登录 Hikarinagi，在开发者控制台创建应用，获得 client_id 与一次性下发的 client_secret',
    },
    {
      number: '02',
      title: '获取令牌',
      description: '以 client_credentials 授权向身份服务换取访问令牌',
    },
    {
      number: '03',
      title: '调用 API',
      description: '携带 Bearer 令牌访问 open 端点',
    },
  ]
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="grid gap-4 md:grid-cols-3">
      <div
        v-for="step in steps"
        :key="step.number"
        class="flex flex-col gap-3 rounded-xl border border-surface p-6"
      >
        <span class="font-mono text-3xl font-semibold text-hikari-primary-500/60">
          {{ step.number }}
        </span>
        <h3 class="text-lg font-semibold text-color">{{ step.title }}</h3>
        <p class="text-sm leading-relaxed text-muted-color">{{ step.description }}</p>
      </div>
    </div>
  </section>
</template>

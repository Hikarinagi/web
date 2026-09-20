<script setup lang="ts">
  defineOptions({ name: 'DeveloperReferenceIntro' })
  defineProps<{ issuer: string }>()

  const GATES = [
    {
      title: '所需 scope',
      detail:
        '逐端点标注。令牌缺少其中任意一项即返回 403，响应会指出缺失的具体 scope。scope 集合不得超出应用在控制台勾选的范围。',
    },
    {
      title: '是否需要用户授权',
      detail:
        '标注于每组标题旁。「需用户授权」的端点要求令牌代表某个已授权用户，只有授权码流程签发的令牌满足；「无需用户授权」的端点两种流程签发的令牌都可调用。',
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
      能否调用一个端点由两件事决定，与令牌来自哪种授权流程无关。响应示例展示的是信封内
      <code class="font-mono">data</code>
      字段的内容，完整信封见
      <NuxtLink to="/developers/docs#conventions" class="text-primary hover:text-primary-600">
        响应约定
      </NuxtLink>
      。
    </p>

    <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div
        v-for="gate in GATES"
        :key="gate.title"
        class="grid grid-cols-1 gap-1 py-2.5 sm:grid-cols-[minmax(0,13rem)_1fr] sm:gap-4"
      >
        <span class="text-sm text-color">{{ gate.title }}</span>
        <span class="text-xs leading-relaxed text-muted-color">{{ gate.detail }}</span>
      </div>
    </div>

    <p class="text-xs text-muted-color">
      Hikarinagi ID issuer：
      <code class="font-mono break-all">{{ issuer }}</code>
    </p>
  </section>
</template>

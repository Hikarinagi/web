<script setup lang="ts">
  import type { DevelopersDocsPageData } from '~~/server/api/pages/developers/docs.get'
  import type { ReferenceAuth } from '~~/server/features/developer/reference'

  defineOptions({ name: 'DevelopersDocsPage' })
  definePageMeta({ container: 'full' })

  const { data } = await useHikariApiData<DevelopersDocsPageData>('/api/pages/developers/docs', {
    fatal: true,
  })

  const AUTH_BADGE: Record<ReferenceAuth, { label: string; severity: string }> = {
    app: { label: '应用级令牌', severity: 'secondary' },
    user: { label: '用户级令牌', severity: 'warn' },
  }

  useHikariSeoMeta({
    title: '开发者文档',
    description: () =>
      'Hikarinagi 开放平台文档：授权方式、授权码 + PKCE 流程、scope 目录、令牌生命周期、响应约定与全部端点参考',
  })
</script>

<template>
  <DeveloperDocsShell v-if="data" :groups="data.groups">
    <header class="flex flex-col gap-3">
      <h1 class="text-4xl font-extrabold tracking-tight text-color">Hikarinagi Public API</h1>
      <p class="text-muted-color">读取公开条目数据，或在用户授权后代表用户进行数据读写。</p>
    </header>

    <DeveloperGuideAuth />
    <DeveloperGuideAppFlow :guide="data" />
    <DeveloperGuideUserFlow :guide="data" />
    <DeveloperGuideScopes />
    <DeveloperGuideTokens :guide="data" />
    <DeveloperGuideConventions :guide="data" />

    <DeveloperReferenceIntro :issuer="data.issuer" />

    <section v-for="group in data.groups" :key="group.tag" class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-3">
        <h2 class="text-2xl font-bold text-color">{{ group.title }}</h2>
        <Tag :value="AUTH_BADGE[group.auth].label" :severity="AUTH_BADGE[group.auth].severity" />
      </div>
      <p v-if="group.description" class="text-sm text-muted-color">{{ group.description }}</p>

      <DeveloperReferenceOperation
        v-for="operation in group.operations"
        :key="operation.id"
        :operation
      />
    </section>
  </DeveloperDocsShell>
</template>

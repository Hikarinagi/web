<script setup lang="ts">
  import { DEVELOPER_SCOPES } from '~/features/developer/scopes'

  defineOptions({ name: 'DeveloperGuideScopes' })
</script>

<template>
  <section id="scopes" class="flex scroll-mt-[calc(var(--app-header-height)+16px)] flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h2 class="text-2xl font-bold text-color">权限范围</h2>
      <p class="text-sm leading-relaxed text-muted-color">
        应用可申请的 scope 在控制台勾选，换取令牌时请求的 scope 不得超出该集合。标注「需用户授权」的
        scope 仅可通过授权码流程取得；即使已在控制台勾选，应用级令牌也不会包含这些 scope。
      </p>
    </div>

    <div class="flex flex-col divide-y divide-surface-100 dark:divide-surface-800">
      <div
        v-for="entry in DEVELOPER_SCOPES"
        :key="entry.scope"
        class="grid grid-cols-1 gap-1.5 py-3 sm:grid-cols-[minmax(0,10rem)_1fr] sm:gap-4"
      >
        <div class="flex flex-col gap-1.5">
          <code class="font-mono text-sm font-medium text-color">{{ entry.scope }}</code>
          <Tag
            v-if="entry.requires_user"
            severity="secondary"
            value="需用户授权"
            class="self-start"
          />
        </div>
        <div class="flex flex-col gap-0.5">
          <p class="text-sm text-color">{{ entry.label }}</p>
          <p class="text-xs leading-relaxed text-muted-color">{{ entry.description }}</p>
        </div>
      </div>
    </div>

    <p class="text-sm leading-relaxed text-muted-color">
      存在两组蕴含关系：
      <code class="font-mono">catalog:full</code>
      包含
      <code class="font-mono">catalog:read</code>
      ，
      <code class="font-mono">status:write</code>
      包含
      <code class="font-mono">status:read</code>
      。申请上位 scope 即可，无需重复勾选。
    </p>
  </section>
</template>

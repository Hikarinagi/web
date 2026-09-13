<script setup lang="ts">
  import { ChevronRight } from '@lucide/vue'
  import type { DevelopersConsolePageData } from '~~/server/api/pages/developers/console.get'

  defineOptions({ name: 'DeveloperConsoleAppItem' })

  const props = defineProps<{ app: DevelopersConsolePageData['apps'][number] }>()

  const createdAt = computed(() => new Date(props.app.created_at).toLocaleDateString('zh-CN'))
</script>

<template>
  <NuxtLink
    :to="`/developers/console/apps/${app.client_id}`"
    class="-mx-2 flex items-center gap-4 rounded-lg px-2 py-4 transition-colors hover:bg-emphasis"
  >
    <DeveloperConsoleAppIcon :src="app.logo" :name="app.client_name" />
    <div class="flex min-w-0 flex-1 flex-col gap-1">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-semibold text-color">{{ app.client_name }}</span>
        <Tag v-if="!app.enabled" severity="secondary" value="已停用" />
      </div>
      <code class="truncate font-mono text-sm text-muted-color">{{ app.client_id }}</code>
      <p class="text-xs text-muted-color">scope {{ app.scope }} · 创建于 {{ createdAt }}</p>
    </div>
    <ChevronRight class="size-5 shrink-0 text-muted-color" />
  </NuxtLink>
</template>

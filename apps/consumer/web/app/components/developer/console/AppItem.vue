<script setup lang="ts">
  import { Code, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import type { DevelopersConsolePageData } from '~~/server/api/pages/developers/console.get'

  defineOptions({ name: 'DeveloperConsoleAppItem' })

  const props = defineProps<{ app: DevelopersConsolePageData['apps'][number] }>()

  const createdAt = computed(() => new Date(props.app.created_at).toLocaleDateString('zh-CN'))
</script>

<template>
  <NuxtLink
    :to="`/developers/console/apps/${app.client_id}`"
    class="-mx-2 flex hn-interactive items-center gap-4 rounded-lg px-2 py-4 hover:bg-subtle"
  >
    <DeveloperConsoleAppIcon :src="app.logo" :name="app.client_name" />
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center" wrap>
        <Text as="span" weight="semibold">{{ app.client_name }}</Text>
        <Tag v-if="!app.enabled">已停用</Tag>
      </Inline>
      <Code class="truncate">{{ app.client_id }}</Code>
      <Text as="span" size="xs" tone="muted">scope {{ app.scope }} · 创建于 {{ createdAt }}</Text>
    </Stack>
    <ChevronRight class="size-5 shrink-0 text-muted" aria-hidden="true" />
  </NuxtLink>
</template>

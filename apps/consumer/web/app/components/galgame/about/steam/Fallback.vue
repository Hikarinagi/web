<script setup lang="ts">
  import { Button, Card, Inline, Text } from '@hina-ui/vue'
  import { ExternalLink, RotateCw } from '@lucide/vue'

  defineOptions({ name: 'GalgameAboutSteamFallback' })
  const props = defineProps<{ appIds: number[]; failed: boolean }>()
  defineEmits<{ retry: [] }>()

  const links = computed(() =>
    props.appIds.map((appId, index) => ({
      appId,
      url: `https://store.steampowered.com/app/${appId}/`,
      label: props.appIds.length > 1 ? `商店页 ${index + 1}` : '在 Steam 上查看',
    })),
  )
</script>

<template>
  <Card>
    <Inline gap="sm" align="center" justify="between" wrap>
      <Text as="p" size="sm" tone="muted">无法从 Steam 获取信息</Text>

      <Inline gap="sm" align="center" wrap>
        <Button v-if="failed" variant="ghost" tone="neutral" size="sm" @click="$emit('retry')">
          <template #icon><RotateCw /></template>
          重试
        </Button>

        <Button
          v-for="link in links"
          :key="link.appId"
          as="a"
          :href="link.url"
          target="_blank"
          rel="noopener noreferrer"
          variant="soft"
          tone="neutral"
          size="sm"
        >
          <template #icon><ExternalLink /></template>
          {{ link.label }}
        </Button>
      </Inline>
    </Inline>
  </Card>
</template>

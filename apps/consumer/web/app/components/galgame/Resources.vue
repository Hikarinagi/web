<script setup lang="ts">
  import { Card, Inline, Ripple, Stack, Text } from '@hina-ui/vue'
  import { ChevronRight, Download } from '@lucide/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'GalgameResources' })
  defineProps<{ galgameId: number; count: number }>()
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="`/galgames/${galgameId}/downloads`"
    class="hn-state-layer hn-interactive hn-press-lg"
  >
    <Ripple />
    <Inline gap="md" align="center" :wrap="false">
      <Download class="size-4 text-muted" />
      <Stack gap="none" class="flex-1">
        <Text size="sm" weight="medium">资源下载</Text>
        <Text size="xs" tone="muted">{{ count }} 个资源</Text>
      </Stack>
      <ChevronRight class="size-4 text-muted" />
    </Inline>
  </Card>
</template>

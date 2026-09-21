<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'GalgameExploreBrowseEntry' })
</script>

<template>
  <Inline as="section" gap="md" align="center" justify="between" class="flex-col py-2 sm:flex-row">
    <Stack gap="xs" align="start">
      <Heading :level="2" size="lg">想按发售日、关键词筛选？</Heading>
      <Text as="p" size="sm" tone="muted">在图鉴中使用高级筛选功能</Text>
    </Stack>
    <Button :as="NuxtLink" to="/galgames/browse" variant="outline" tone="neutral">
      进入图鉴
      <template #trailing><ArrowUpRight /></template>
    </Button>
  </Inline>
</template>

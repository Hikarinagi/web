<script setup lang="ts">
  import { Card, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ItemsPageData } from '~~/server/api/pages/setting/items.get'

  defineOptions({ name: 'SpaceSettingItemPanel' })

  defineProps<{ data: ItemsPageData; refresh: () => Promise<unknown> }>()
</script>

<template>
  <Stack gap="lg">
    <Card>
      <Inline as="span" gap="xs" align="baseline">
        <HikariPoint class="size-5 self-center" aria-hidden="true" />
        <Text as="span" size="2xl" weight="semibold">{{ data.points }}</Text>
        <Inline as="span" gap="xs" align="center">
          <Text as="span" size="xs" tone="muted">光点</Text>
          <Question title="关于光点" tooltip="了解光点" size="lg">
            <CheckinHikariPointContent />
          </Question>
        </Inline>
      </Inline>
    </Card>

    <SpaceSettingItemMakeUpCard
      :card="data.make_up_card"
      :points="data.points"
      :refresh="refresh"
    />
  </Stack>
</template>

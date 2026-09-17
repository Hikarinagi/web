<script setup lang="ts">
  import { Button, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingSecurityForm' })

  defineProps<{ email: string }>()
</script>

<template>
  <Panel title="账号安全" description="前往 Hikarinagi ID 管理中心管理你的账号信息">
    <Inline gap="md" align="center" justify="between" :wrap="false">
      <Stack gap="none" class="min-w-0">
        <Text size="sm" weight="medium" truncate>{{ email }}</Text>
        <Text size="xs" tone="muted">当前登录邮箱</Text>
      </Stack>
      <Button as="a" href="/auth/account" variant="outline" tone="neutral" class="shrink-0">
        <template #icon><ArrowUpRight /></template>
        前往账号管理
      </Button>
    </Inline>
  </Panel>
</template>

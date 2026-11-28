<script setup lang="ts">
  import { Button, Inline, Panel, Stack, Text } from '@hina-ui/vue'
  import { ArrowUpRight } from '@lucide/vue'

  defineOptions({ name: 'SpaceSettingSecurityForm' })

  defineProps<{ email: string }>()
  const { t } = useLocaleText()
</script>

<template>
  <Panel :title="t('setting.nav.account')" :description="t('setting.account.description')">
    <Inline gap="md" align="center" justify="between" :wrap="false">
      <Stack gap="none" class="min-w-0">
        <Text size="sm" weight="medium" truncate>{{ email }}</Text>
        <Text size="xs" tone="muted">{{ t('setting.account.email') }}</Text>
      </Stack>
      <Button as="a" href="/auth/account" variant="outline" tone="neutral" class="shrink-0">
        <template #icon><ArrowUpRight /></template>
        {{ t('setting.account.manage') }}
      </Button>
    </Inline>
  </Panel>
</template>

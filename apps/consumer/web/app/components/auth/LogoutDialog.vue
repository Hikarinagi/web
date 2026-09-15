<script setup lang="ts">
  import { Button, Dialog, Stack, Text } from '@hina-ui/vue'
  import { LogOut, ShieldCheck } from '@lucide/vue'

  const { visible, pending, pendingScope, submit } = useLogout()
</script>

<template>
  <Dialog v-model:open="visible" title="退出登录" size="sm" :locked="pending">
    <template #content>
      <Stack gap="sm">
        <Text tone="muted" size="sm">选择登出范围</Text>

        <Button
          block
          autofocus
          size="lg"
          class="h-auto justify-start py-3"
          :loading="pendingScope === 'global'"
          :disabled="pending"
          @click="submit('global')"
        >
          <template #icon>
            <ShieldCheck />
          </template>
          <Stack gap="none" align="start" class="min-w-0">
            <Text as="span" weight="medium" class="text-inherit">登出全部</Text>
            <Text as="span" size="xs" class="text-inherit opacity-80">
              撤销本设备所有站点的 Hikarinagi ID 登录态
            </Text>
          </Stack>
        </Button>

        <Button
          block
          variant="outline"
          tone="neutral"
          size="lg"
          class="h-auto justify-start py-3"
          :loading="pendingScope === 'local'"
          :disabled="pending"
          @click="submit('local')"
        >
          <template #icon>
            <LogOut />
          </template>
          <Stack gap="none" align="start" class="min-w-0">
            <Text as="span" weight="medium" class="text-inherit">仅退出本站</Text>
            <Text as="span" size="xs" tone="muted">下次可无需密码快速登录</Text>
          </Stack>
        </Button>
      </Stack>
    </template>
  </Dialog>
</template>

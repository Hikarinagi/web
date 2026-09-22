<script setup lang="ts">
  import { Button, Dialog, Image, Stack, Text } from '@hina-ui/vue'
  import type { AuthMode } from '~/types/auth'

  defineOptions({ name: 'AuthLoginPrompt' })

  const { toLogin, promptOpen } = useAuthGate()

  function go(mode: AuthMode) {
    promptOpen.value = false
    toLogin(mode)
  }
</script>

<template>
  <Dialog v-model:open="promptOpen" title="欢迎来到 Hikarinagi" size="md">
    <template #body>
      <Stack gap="lg" align="center" class="p-8 text-center">
        <Image
          src="/brand/hikarinagi-icon.webp"
          alt=""
          eager
          :lazy="false"
          :skeleton="false"
          :draggable="false"
          fit="contain"
          class="size-16 rounded-2xl"
        />
        <Stack gap="xs">
          <Text size="xl" weight="semibold">欢迎来到 <BrandMark inline /></Text>
          <Text tone="muted">
            登入或注册你的 <BrandMark mark="id" inline />，立刻解锁完整功能
          </Text>
        </Stack>
        <Stack gap="sm" class="w-full">
          <Button size="lg" @click="go('login')">登录</Button>
          <Button size="lg" variant="outline" tone="neutral" @click="go('register')"
            >注册新账号</Button
          >
        </Stack>
      </Stack>
    </template>
  </Dialog>
</template>

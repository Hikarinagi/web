<script setup lang="ts">
  import { Button, Center, Empty } from '@hina-ui/vue'
  import { LogIn } from '@lucide/vue'

  defineOptions({ name: 'LightNovelReaderStageGuest' })

  const { toLogin } = useAuthGate()
</script>

<template>
  <Center class="absolute inset-0 bg-canvas p-4">
    <Empty
      title="登录后即可阅读"
      description="阅读进度、高亮和笔记将保存至你的账号，可在其他设备上继续阅读。"
      class="max-w-sm"
    >
      <template #icon><LogIn aria-hidden="true" /></template>
      <template #actions>
        <Button size="sm" @click="toLogin('login')">登录</Button>
        <Button size="sm" variant="ghost" tone="neutral" @click="toLogin('register')">注册</Button>
      </template>
    </Empty>
  </Center>
</template>

<script setup lang="ts">
  import { Card, Heading, Inline, Stack } from '@hina-ui/vue'

  const { toLogin } = useAuthGate()
</script>

<template>
  <Card as="section">
    <Stack gap="md">
      <Heading :level="2" size="base">登录，看你的专属动态</Heading>
      <Inline gap="sm">
        <Button login-required class="flex-1">登录</Button>
        <Button variant="outline" tone="neutral" @click="toLogin('register')">注册</Button>
      </Inline>
    </Stack>
  </Card>
</template>

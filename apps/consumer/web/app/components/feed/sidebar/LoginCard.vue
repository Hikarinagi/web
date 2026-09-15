<script setup lang="ts">
  import { Button, Card, Heading, Inline, Stack } from '@hina-ui/vue'

  const { toLogin } = useAuthGate()
</script>

<template>
  <Card as="section">
    <Stack gap="md">
      <Heading :level="2" size="base">登录，看你的专属动态</Heading>
      <Inline gap="sm">
        <AuthGateButton class="flex-1">登录</AuthGateButton>
        <Button variant="outline" tone="neutral" @click="toLogin('register')">注册</Button>
      </Inline>
    </Stack>
  </Card>
</template>

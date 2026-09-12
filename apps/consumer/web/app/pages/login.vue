<script setup lang="ts">
  import { Button, Stack } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  const route = useRoute()
  const { toLogin } = useAuthGate()
  const authError = typeof route.query.auth_error === 'string'
  const adminOnly = route.query.auth_error === 'admin_only'
  const redirectTo =
    typeof route.query.redirect_to === 'string' && route.query.redirect_to.startsWith('/')
      ? route.query.redirect_to
      : '/'

  onMounted(() => {
    if (!authError) toLogin('login', redirectTo)
  })
</script>

<template>
  <AuthPageCard
    v-if="adminOnly"
    subtitle="当前为预发布环境，只有管理员账号可以登录。"
    title="仅管理员可登录"
  >
    <Stack gap="sm">
      <Button block @click="toLogin('login', redirectTo)">换账号登录</Button>
      <Button :as="NuxtLink" to="/" block variant="outline" tone="neutral">返回首页</Button>
    </Stack>
  </AuthPageCard>
  <AuthPageCard
    v-else-if="authError"
    subtitle="刚才的登录没有完成，请重新尝试。"
    title="登录未完成"
  >
    <Button block @click="toLogin('login', redirectTo)">重新登录</Button>
  </AuthPageCard>
  <AuthRedirecting v-else text="正在前往登录…" />
</template>

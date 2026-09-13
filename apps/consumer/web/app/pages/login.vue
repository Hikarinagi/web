<script setup lang="ts">
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
    <div class="flex flex-col gap-2">
      <Button class="w-full" label="换账号登录" @click="toLogin('login', redirectTo)" />
      <Button
        as="router-link"
        class="w-full"
        label="返回首页"
        outlined
        severity="secondary"
        to="/"
      />
    </div>
  </AuthPageCard>
  <AuthPageCard
    v-else-if="authError"
    subtitle="刚才的登录没有完成，请重新尝试。"
    title="登录未完成"
  >
    <Button class="w-full" label="重新登录" @click="toLogin('login', redirectTo)" />
  </AuthPageCard>
  <AuthRedirecting v-else text="正在前往登录…" />
</template>

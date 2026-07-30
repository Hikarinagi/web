<script setup lang="ts">
  const route = useRoute()
  const { toLogin } = useAuthGate()
  const redirectTo =
    typeof route.query.redirect_to === 'string' && route.query.redirect_to.startsWith('/')
      ? route.query.redirect_to
      : '/'

  onMounted(() => toLogin('register', redirectTo))
</script>

<template>
  <AuthRedirecting text="正在前往注册…" />
</template>

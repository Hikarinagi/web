<script setup lang="ts">
  definePageMeta({
    layout: 'creator',
    middleware: 'auth',
    floatingToolbar: false,
    title: '内容显示确认',
  })

  const route = useRoute()
  const redirectTo = computed(() => {
    const value = Array.isArray(route.query.redirect_to)
      ? route.query.redirect_to[0]
      : route.query.redirect_to
    return typeof value === 'string' &&
      (value.startsWith('/entries/') || value.startsWith('/create/wiki/new'))
      ? value
      : '/create/wiki/new'
  })
</script>

<template>
  <CreatorEditorContentLimitGate :redirect-to="redirectTo" />
</template>

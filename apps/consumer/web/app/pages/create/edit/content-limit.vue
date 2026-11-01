<script setup lang="ts">
  definePageMeta({ title: '内容显示确认' })

  const route = useRoute()
  const redirectTo = computed(() => {
    const value = Array.isArray(route.query.redirect_to)
      ? route.query.redirect_to[0]
      : route.query.redirect_to

    if (
      typeof value === 'string' &&
      value.startsWith('/create/edit') &&
      !value.startsWith('/create/edit/content-limit')
    ) {
      return value
    }

    return '/create/edit'
  })
</script>

<template>
  <CreatorEditorContentLimitGate :redirect-to="redirectTo" />
</template>

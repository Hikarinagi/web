<script setup lang="ts">
  definePageMeta({
    container: 'full',
    footer: false,
    bottomBar: false,
    floatingToolbar: false,
  })

  useHikariSeoMeta({ title: '作品投稿' })
</script>

<template>
  <ContributeScene class="-mt-(--app-header-height)" />
</template>

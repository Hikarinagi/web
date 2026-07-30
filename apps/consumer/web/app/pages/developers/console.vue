<script setup lang="ts">
  defineOptions({ name: 'DevelopersConsoleShellPage' })
  definePageMeta({ middleware: 'auth' })
</script>

<template>
  <div class="flex flex-col gap-6 py-8">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <h1 class="text-2xl font-bold text-color">开发者控制台</h1>
      <Button
        label="API 文档"
        severity="secondary"
        outlined
        as="router-link"
        to="/developers/reference"
      />
    </div>
    <NuxtPage />
  </div>
</template>

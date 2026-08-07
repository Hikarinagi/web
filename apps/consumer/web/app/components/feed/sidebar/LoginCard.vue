<script setup lang="ts">
  const { toLogin } = useAuthGate()
</script>

<template>
  <section
    class="flex flex-col gap-3 rounded-xl border border-surface-200 bg-surface-0 p-4 shadow-[0_1px_1.5px_rgba(15,23,42,0.05)] dark:border-surface-800 dark:bg-surface-900"
  >
    <h2 class="font-bold text-color">登录，看你的专属动态</h2>
    <div class="flex gap-2">
      <Button login-required label="登录" class="flex-1" />
      <Button label="注册" severity="secondary" outlined @click="toLogin('register')" />
    </div>
  </section>
</template>

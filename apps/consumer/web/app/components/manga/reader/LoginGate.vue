<script setup lang="ts">
  defineOptions({ name: 'MangaReaderLoginGate' })

  const props = defineProps<{ mangaId: number }>()

  function back() {
    void navigateTo(`/mangas/${props.mangaId}`)
  }
</script>

<template>
  <div class="flex h-dvh flex-col items-center justify-center gap-6 bg-[#06080c] px-6">
    <div class="flex flex-col items-center gap-1.5 text-center">
      <h1 class="text-lg font-semibold text-white">登录后继续阅读</h1>
      <p class="text-sm text-[#8b95a6]">登录后免费阅读全部章节，还可以随时随地同步阅读进度</p>
    </div>
    <div class="flex items-center gap-3">
      <Button login-required rounded label="登录 / 注册" class="px-6" />
      <Button rounded severity="contrast" label="返回详情页" @click="back" />
    </div>
  </div>
</template>

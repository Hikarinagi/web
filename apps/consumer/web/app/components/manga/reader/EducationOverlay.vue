<script setup lang="ts">
  import { MoveLeft, MoveRight } from '@lucide/vue'

  defineOptions({ name: 'MangaReaderEducationOverlay' })

  const emit = defineEmits<{ dismiss: [] }>()

  const cardClass =
    'flex w-60 flex-col items-center gap-1.5 rounded-xl border border-white/10 bg-[#0a0d12]/92 px-6 py-5 text-center'
</script>

<template>
  <div class="absolute inset-0 z-50 overflow-y-auto bg-black/72">
    <div
      class="flex min-h-full flex-col items-center justify-center gap-4 px-6 py-10 sm:relative sm:block sm:h-full sm:min-h-0 sm:p-0"
    >
      <div :class="cardClass" class="sm:absolute sm:top-1/2 sm:left-[8%] sm:-translate-y-1/2">
        <MoveRight :size="22" class="text-primary" aria-hidden="true" />
        <p class="text-sm font-semibold text-white">右滑 下一页</p>
        <p class="text-xs text-[#8b95a6]">从右往左读，顺着翻页方向拖</p>
      </div>

      <div :class="cardClass" class="sm:absolute sm:top-1/2 sm:right-[8%] sm:-translate-y-1/2">
        <MoveLeft :size="22" class="text-primary" aria-hidden="true" />
        <p class="text-sm font-semibold text-white">左滑 上一页</p>
        <p class="text-xs text-[#8b95a6]">桌面也能用 ← → 方向键</p>
      </div>

      <div
        :class="cardClass"
        class="sm:absolute sm:top-[38%] sm:left-1/2 sm:w-72 sm:-translate-x-1/2 sm:-translate-y-1/2"
      >
        <p class="text-sm font-semibold text-white">单击 呼出工具栏</p>
        <p class="text-xs text-[#8b95a6]">右键 / 长按也可以，调整设置、快速跳页都在这里</p>
      </div>

      <div class="sm:absolute sm:bottom-[16%] sm:left-1/2 sm:-translate-x-1/2">
        <Button rounded label="知道了，开始阅读" @click="emit('dismiss')" />
      </div>
    </div>
  </div>
</template>

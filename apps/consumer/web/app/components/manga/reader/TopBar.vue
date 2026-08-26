<script setup lang="ts">
  import { ArrowLeft, List } from '@lucide/vue'

  defineOptions({ name: 'MangaReaderTopBar' })

  defineProps<{
    title: string
    chapterLabel: string
  }>()

  const emit = defineEmits<{
    back: []
    openCatalog: []
  }>()
</script>

<template>
  <div
    class="pointer-events-none absolute inset-x-0 top-0 z-20 h-18 bg-linear-to-b from-black/70 to-transparent"
  >
    <div class="pointer-events-auto flex h-15 items-center gap-3.5 px-5">
      <Button
        unstyled
        class="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
        aria-label="返回详情页"
        @click="emit('back')"
      >
        <ArrowLeft :size="20" aria-hidden="true" />
      </Button>
      <h1 class="min-w-0 shrink truncate text-[15px] font-medium text-white">{{ title }}</h1>
      <p class="min-w-0 shrink truncate text-[13px] text-[#b8c2d1]">{{ chapterLabel }}</p>
      <span class="w-2.5 shrink-0" />
      <Button
        unstyled
        class="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/20"
        aria-label="章节目录"
        @click="emit('openCatalog')"
      >
        <List :size="17" aria-hidden="true" />
      </Button>
    </div>
  </div>
</template>

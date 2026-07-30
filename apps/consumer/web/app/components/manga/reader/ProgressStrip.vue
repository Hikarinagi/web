<script setup lang="ts">
  defineOptions({ name: 'MangaReaderProgressStrip' })

  const props = defineProps<{
    total: number
    filled: number
  }>()

  const emit = defineEmits<{ jump: [page: number] }>()

  const pages = computed(() => Array.from({ length: props.total }, (_, index) => index + 1))
</script>

<template>
  <div class="flex flex-row-reverse gap-1">
    <Button
      v-for="page in pages"
      :key="page"
      v-tooltip.top="`第 ${page} 页`"
      unstyled
      class="group flex h-4 max-w-2.5 min-w-0 flex-1 cursor-pointer items-center"
      :aria-label="`跳到第 ${page} 页`"
      @click="emit('jump', page)"
    >
      <span
        class="h-1.5 w-full rounded-[3px] transition-colors"
        :class="page <= filled ? 'bg-primary' : 'bg-white/20 group-hover:bg-white/45'"
      />
    </Button>
  </div>
</template>

<script setup lang="ts">
  import type { FeedItemByType } from '~/features/feed/feed'

  const props = defineProps<{ item: FeedItemByType<'post'> }>()

  const extra = computed(() => props.item.cover_count - props.item.covers.length)
  const aspect = (c: { width: number | null; height: number | null }) =>
    c.width && c.height ? `${c.width} / ${c.height}` : '3 / 4'
  const coverProcessing = computed(() =>
    props.item.covers.length === 1
      ? { width: 720, quality: 85, fit: 'scale-down' as const }
      : { width: 560, height: 320, quality: 82, fit: 'cover' as const },
  )
</script>

<template>
  <div class="flex flex-col gap-3">
    <p v-if="item.excerpt" class="text-[15px] leading-relaxed whitespace-pre-wrap text-color">
      {{ item.excerpt }}
    </p>
    <div v-if="item.covers.length" class="flex flex-wrap gap-2">
      <div
        v-for="(cover, i) in item.covers"
        :key="cover.id"
        class="relative z-1 shrink-0 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-800"
        :class="item.covers.length === 1 ? 'h-72 max-w-full' : 'h-40 max-w-[280px]'"
        :style="{ aspectRatio: aspect(cover) }"
      >
        <HikariImage
          :src="cover.src"
          alt=""
          class="size-full"
          image-class="size-full object-cover"
          :processing="coverProcessing"
          preview
        />
        <div
          v-if="i === item.covers.length - 1 && extra > 0"
          class="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-semibold text-white"
        >
          +{{ extra }}
        </div>
      </div>
    </div>
    <div v-if="item.poll" class="relative z-1">
      <HikariContentNodesPollCard :poll="item.poll" />
    </div>
  </div>
</template>

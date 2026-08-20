<script setup lang="ts">
  import type { FeedItemByType } from '~/features/feed/feed'

  type Cover = FeedItemByType<'post'>['covers'][number]

  const props = defineProps<{ postId: number; covers: Cover[]; coverCount: number }>()

  // P02:feed 只带前 4 张图,末位 +N 蒙层点击后拉详情接口就地展开完整宫格
  const expanded = ref<Cover[] | null>(null)
  const expanding = ref(false)
  const shown = computed(() => expanded.value ?? props.covers)
  const extra = computed(() => (expanded.value ? 0 : props.coverCount - props.covers.length))
  const aspect = (c: Cover) => (c.width && c.height ? `${c.width} / ${c.height}` : '3 / 4')
  const coverProcessing = computed(() =>
    shown.value.length === 1
      ? { width: 720, quality: 85, fit: 'scale-down' as const }
      : { width: 560, height: 320, quality: 82, fit: 'cover' as const },
  )

  async function expandAll() {
    if (expanding.value || expanded.value) return
    expanding.value = true
    try {
      const detail = await hikariRequest('/api/v3/posts/{id}', { path: { id: props.postId } })
      expanded.value = detail.covers.map(c => c.media)
    } catch {
      // 失败提示由 hikariRequest 默认的 Notivue toast 承担
    } finally {
      expanding.value = false
    }
  }
</script>

<template>
  <div v-if="shown.length" class="flex flex-wrap gap-2">
    <div
      v-for="(cover, i) in shown"
      :key="cover.id"
      class="relative z-1 shrink-0 overflow-hidden rounded-lg border border-surface-200 dark:border-surface-800"
      :class="shown.length === 1 ? 'h-72 max-w-full' : 'h-40 max-w-[280px]'"
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
      <Button
        v-if="i === shown.length - 1 && extra > 0"
        unstyled
        class="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/50 text-lg font-semibold text-white"
        :aria-label="`展开剩余 ${extra} 张图片`"
        @click.stop="expandAll"
      >
        <Spinner v-if="expanding" :size="20" :label="null" />
        <span v-else>+{{ extra }}</span>
      </Button>
    </div>
  </div>
</template>

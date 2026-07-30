<script setup lang="ts">
  import { COMMENT_THREAD_KEY } from '~/features/comment/useThread'

  defineOptions({ name: 'CommentList' })

  defineProps<{ authorId?: number | null }>()

  const thread = inject(COMMENT_THREAD_KEY)!
  const { items, loading, hasMoreUp, hasMoreDown, loadMoreUp, loadMoreDown } = thread

  // 已删除评论只在「顶层 + 有子回复」时保留 tombstone(承载回复线索);顶层无子的删除评论不显示。
  const visibleItems = computed(() => items.value.filter(c => !c.is_deleted || c.child_total > 0))

  const listEl = ref<HTMLElement | null>(null)
  const topSentinel = ref<HTMLElement | null>(null)
  const bottomSentinel = ref<HTMLElement | null>(null)
  const loadingUp = ref(false)

  // 视口顶部第一个仍可见的评论,作为向上加载的锚
  function topAnchor(): HTMLElement | null {
    const nodes = listEl.value?.querySelectorAll<HTMLElement>('article[id^="comment-"]')
    if (!nodes) return null
    for (const n of nodes) if (n.getBoundingClientRect().bottom > 0) return n
    return null
  }

  // 向上加载:顶部骨架、prepend 都会把已读内容顶下去。以真实锚评论为基准,
  // 每次 DOM 变化后把 scrollTop 校回锚点原视口位置(不依赖 scrollHeight,免受 flush 时序/级联影响),阅读位置不动。
  async function onTopEnter() {
    if (!hasMoreUp.value || loading.value || loadingUp.value) return
    const el = document.scrollingElement ?? document.documentElement
    const anchor = topAnchor()
    const anchorTop = anchor?.getBoundingClientRect().top ?? 0
    loadingUp.value = true
    await nextTick()
    if (anchor) el.scrollTop += anchor.getBoundingClientRect().top - anchorTop
    await loadMoreUp()
    loadingUp.value = false
    await nextTick()
    if (anchor) el.scrollTop += anchor.getBoundingClientRect().top - anchorTop
  }

  useIntersectionObserver(
    topSentinel,
    ([entry]) => {
      if (entry?.isIntersecting) void onTopEnter()
    },
    { rootMargin: '300px' },
  )
  useIntersectionObserver(
    bottomSentinel,
    ([entry]) => {
      if (entry?.isIntersecting && !loadingUp.value) loadMoreDown()
    },
    { rootMargin: '300px' },
  )
</script>

<template>
  <div>
    <p v-if="!visibleItems.length && !loading" class="py-8 text-center text-sm text-muted-color">
      还没有人评论，你来发第一条！
    </p>

    <template v-else>
      <div ref="topSentinel" class="h-px" />
      <div v-if="loadingUp" class="space-y-6 pb-6">
        <CommentItemSkeleton v-for="i in 2" :key="i" />
      </div>

      <div ref="listEl" class="space-y-6">
        <CommentItem v-for="c in visibleItems" :key="c.id" :comment="c" :author-id="authorId" />
      </div>

      <div ref="bottomSentinel" class="h-px" />

      <div v-if="loading && !loadingUp" class="space-y-6 pt-6">
        <CommentItemSkeleton v-for="i in 2" :key="i" />
      </div>
      <p
        v-else-if="!hasMoreDown && visibleItems.length"
        class="py-5 text-center text-xs text-muted-color"
      >
        没有更多了
      </p>
    </template>
  </div>
</template>

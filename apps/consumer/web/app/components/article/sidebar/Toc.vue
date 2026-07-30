<script setup lang="ts">
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { cn } from '~/utils/cn'
  import { extractToc } from '~/features/article/toc'
  import { useTocSpy } from '~/features/article/composables/useTocSpy'

  const props = defineProps<{ doc: ArticlePageData['article']['content_json'] }>()

  const entries = computed(() => extractToc(props.doc))
  const { activeId, scrollTo } = useTocSpy(() => entries.value.map(e => e.id))

  const scrollArea = useTemplateRef<{ viewport: HTMLElement | null }>('scrollArea')
  watch(activeId, id => {
    const vp = scrollArea.value?.viewport
    if (!id || !vp) return
    const active = vp.querySelector<HTMLElement>(`[data-toc-id="${id}"]`)
    if (!active) return
    const top = active.getBoundingClientRect().top - vp.getBoundingClientRect().top + vp.scrollTop
    const bottom = top + active.offsetHeight
    if (top < vp.scrollTop) vp.scrollTo({ top: top - 8, behavior: 'smooth' })
    else if (bottom > vp.scrollTop + vp.clientHeight)
      vp.scrollTo({ top: bottom - vp.clientHeight + 8, behavior: 'smooth' })
  })
</script>

<template>
  <ArticlePanel v-if="entries.length >= 2" title="目录">
    <ScrollArea ref="scrollArea" class="max-h-80">
      <div class="pb-2">
        <Button
          v-for="e in entries"
          :key="e.id"
          unstyled
          :data-toc-id="e.id"
          :class="
            cn(
              'block w-full cursor-pointer truncate px-4 py-1.5 text-left text-[13px] transition-colors',
              e.level === 3 && 'pl-7',
              activeId === e.id
                ? 'font-semibold text-primary'
                : 'text-muted-color hover:text-color',
            )
          "
          @click="scrollTo(e.id)"
        >
          {{ e.text }}
        </Button>
      </div>
    </ScrollArea>
  </ArticlePanel>
</template>

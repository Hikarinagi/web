<script setup lang="ts">
  import { Anchor, Panel, ScrollArea } from '@hina-ui/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { extractToc, tocAnchorItems } from '~/features/article/toc'

  const props = defineProps<{ doc: ArticlePageData['article']['content_json'] }>()

  const entries = computed(() => extractToc(props.doc))
  const items = computed(() => tocAnchorItems(entries.value))

  const scrollArea = useTemplateRef<{ viewport: HTMLElement | null }>('scrollArea')
  const viewport = computed(() => scrollArea.value?.viewport ?? null)

  function follow() {
    const vp = viewport.value
    const active = vp?.querySelector<HTMLElement>('a[aria-current]')
    if (!vp || !active) return
    const top = active.getBoundingClientRect().top - vp.getBoundingClientRect().top + vp.scrollTop
    const bottom = top + active.offsetHeight
    if (top < vp.scrollTop) vp.scrollTo({ top: top - 8, behavior: 'smooth' })
    else if (bottom > vp.scrollTop + vp.clientHeight)
      vp.scrollTo({ top: bottom - vp.clientHeight + 8, behavior: 'smooth' })
  }

  useMutationObserver(viewport, follow, {
    subtree: true,
    attributes: true,
    attributeFilter: ['aria-current'],
  })
</script>

<template>
  <Panel v-if="entries.length >= 2" title="目录" :padded="false">
    <ScrollArea ref="scrollArea" class="max-h-80">
      <Anchor :items="items" label="文章目录" class="px-(--hn-panel-p) pb-(--hn-panel-p)" />
    </ScrollArea>
  </Panel>
</template>

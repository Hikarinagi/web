<script setup lang="ts">
  import { Anchor, Sheet } from '@hina-ui/vue'
  import { ListTree } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { extractToc, tocAnchorItems } from '~/features/article/toc'

  defineOptions({ name: 'ArticleMobileToc' })

  const props = defineProps<{ doc: ArticlePageData['article']['content_json'] }>()

  const entries = computed(() => extractToc(props.doc))
  const items = computed(() => tocAnchorItems(entries.value))

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const belowLg = breakpoints.smaller('lg')

  const open = ref(false)
  const { add } = useFloatingToolbar()
  add({
    id: 'article-toc',
    label: '目录',
    icon: ListTree,
    order: 5,
    visible: () => belowLg.value && entries.value.length >= 2,
    onClick: () => {
      open.value = true
    },
  })
</script>

<template>
  <Sheet v-model:open="open" title="目录" class="h-[60dvh]">
    <template #content>
      <Anchor :items="items" label="文章目录" @click="open = false" />
    </template>
  </Sheet>
</template>

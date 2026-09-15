<script setup lang="ts">
  import { Card, Sheet, Stack } from '@hina-ui/vue'
  import { ListTree } from '@lucide/vue'
  import { breakpointsTailwind } from '@vueuse/core'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { cn } from '~/utils/cn'
  import { extractToc } from '~/features/article/toc'
  import { useTocSpy } from '~/features/article/composables/useTocSpy'

  defineOptions({ name: 'ArticleMobileToc' })

  const props = defineProps<{ doc: ArticlePageData['article']['content_json'] }>()

  const entries = computed(() => extractToc(props.doc))
  const { activeId, scrollTo } = useTocSpy(() => entries.value.map(e => e.id))

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

  function select(id: string) {
    scrollTo(id)
    open.value = false
  }

  function entryClass(entry: { id: string; level: number }) {
    return cn(
      'hn-state-layer block w-full hn-interactive truncate px-3 py-2.5 text-start text-sm hn-press-none',
      'rounded-lg border-0 bg-transparent shadow-none',
      entry.level === 3 && 'ps-7',
      activeId.value === entry.id ? 'font-semibold text-accent-text' : 'text-muted',
    )
  }
</script>

<template>
  <Sheet v-model:open="open" title="目录" class="h-[60dvh]">
    <template #content>
      <Stack gap="none">
        <Card
          v-for="entry in entries"
          :key="entry.id"
          as="button"
          type="button"
          :padded="false"
          :class="entryClass(entry)"
          @click="select(entry.id)"
        >
          {{ entry.text }}
        </Card>
      </Stack>
    </template>
  </Sheet>
</template>

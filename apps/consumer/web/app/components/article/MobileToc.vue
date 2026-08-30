<script setup lang="ts">
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
</script>

<template>
  <Drawer
    v-model:visible="open"
    position="bottom"
    :pt="{
      root: { class: 'app-mobile-sheet h-auto! max-h-[72vh]!' },
      content: { class: 'p-2! overflow-y-auto' },
    }"
  >
    <template #header>
      <h2 class="text-base font-semibold text-color">目录</h2>
    </template>

    <div class="pb-1">
      <Button
        v-for="e in entries"
        :key="e.id"
        unstyled
        :class="
          cn(
            'block w-full cursor-pointer truncate rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-emphasis',
            e.level === 3 && 'pl-7',
            activeId === e.id ? 'font-semibold text-primary' : 'text-muted-color',
          )
        "
        @click="select(e.id)"
      >
        {{ e.text }}
      </Button>
    </div>
  </Drawer>
</template>

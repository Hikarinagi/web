<script setup lang="ts">
  import { Anchor, Panel, ScrollArea } from '@hina-ui/vue'
  import type { ArticlePageData } from '~~/server/api/pages/articles/[id].get'
  import { extractToc, tocAnchorItems } from '~/features/article/toc'

  const props = defineProps<{ doc: ArticlePageData['article']['content_json'] }>()

  const entries = computed(() => extractToc(props.doc))
  const items = computed(() => tocAnchorItems(entries.value))
</script>

<template>
  <Panel v-if="entries.length >= 2" title="目录" :padded="false">
    <ScrollArea class="max-h-80">
      <Anchor
        :items="items"
        label="文章目录"
        auto-scroll
        class="px-(--hn-panel-p) pb-(--hn-panel-p)"
      />
    </ScrollArea>
  </Panel>
</template>

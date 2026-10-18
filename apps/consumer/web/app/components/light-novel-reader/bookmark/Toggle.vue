<script setup lang="ts">
  import { IconButton } from '@hina-ui/vue'
  import { Bookmark } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderBookmarkToggle' })

  const { bookmarks, engine } = useReader()
  const { marked } = bookmarks
</script>

<template>
  <IconButton
    :label="marked ? '移除书签' : '添加书签'"
    variant="ghost"
    data-tour="bookmark"
    :aria-pressed="marked"
    :disabled="engine.phase.value !== 'ready'"
    @click="bookmarks.toggle()"
  >
    <Bookmark :fill="marked ? 'currentColor' : 'none'" aria-hidden="true" />
  </IconButton>
</template>

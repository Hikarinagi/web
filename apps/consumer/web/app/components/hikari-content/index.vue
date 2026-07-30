<script setup lang="ts">
  import type { EditorDocument, EditorPresetKey } from '@hikarinagi/editor-schema'
  import { provideContentSummaries, type EntitySummaries } from './composables/useContentSummaries'
  import {
    buildIndexFromSets,
    provideContentEmojiSets,
    type EmojiSetDisplay,
  } from './composables/useContentEmojiSets'

  defineOptions({ name: 'HikariContent' })

  const props = defineProps<{
    doc: EditorDocument
    summaries: EntitySummaries
    emojiSets?: EmojiSetDisplay[]
    preset?: EditorPresetKey
  }>()

  provideContentSummaries(() => props.summaries)
  const emojiIndex = computed(() => buildIndexFromSets(props.emojiSets ?? []))
  provideContentEmojiSets(() => emojiIndex.value)

  const scopeClass = computed(() => {
    switch (props.preset) {
      case 'article':
        return 'hikari-content hikari-content--article'
      case 'post':
        return 'hikari-content hikari-content--post'
      case 'comment':
        return 'hikari-content hikari-content--comment'
      default:
        return 'hikari-content'
    }
  })
</script>

<template>
  <div :class="scopeClass">
    <HikariContentDispatch :node="doc" />
  </div>
</template>

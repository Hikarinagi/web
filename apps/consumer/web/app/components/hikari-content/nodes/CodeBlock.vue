<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'HikariContentNodesCodeBlock' })

  const props = defineProps<{ node: EditorNode }>()

  // code_block 节点的 content 通常是若干 text 节点(无 marks);拼出来即可。
  // 不递归 Dispatch 是因为 code_block 本身就承诺 plain text,不允许 inline marks。
  const text = computed(() =>
    (props.node.content ?? []).map(c => (typeof c.text === 'string' ? c.text : '')).join(''),
  )
  const language = computed(() => {
    const lang = props.node.attrs?.language
    return typeof lang === 'string' && lang.length > 0 ? lang : null
  })
</script>

<template>
  <pre><code :class="language ? `language-${language}` : undefined">{{ text }}</code></pre>
</template>

<script setup lang="ts">
  import type { components } from '@hikarinagi/api-contract/v3'
  import { Link, Spoiler } from '@hina-ui/vue'

  defineOptions({ name: 'GalgameDownloadsGameNote' })
  defineProps<{ nodes: components['schemas']['EditorNodeDto'][] }>()

  const inner = (node: components['schemas']['EditorNodeDto']) => [
    { ...node, marks: node.marks?.slice(1) },
  ]
  const href = (node: components['schemas']['EditorNodeDto']) => {
    const url = node.marks?.[0]?.attrs?.href
    return typeof url === 'string' && /^(https?:|mailto:)/i.test(url) ? url : undefined
  }
</script>

<template>
  <template v-for="(node, index) in nodes" :key="index">
    <template v-if="node.type === 'paragraph'">
      <template v-if="index">{{ '\n' }}</template>
      <GalgameDownloadsGameNote :nodes="node.content ?? []" />
    </template>
    <template v-else-if="node.type === 'hard_break'">{{ '\n' }}</template>
    <Link
      v-else-if="node.marks?.[0]?.type === 'link' && href(node)"
      :href="href(node)"
      target="_blank"
      rel="noreferrer"
      class="break-all"
    >
      <GalgameDownloadsGameNote :nodes="inner(node)" />
    </Link>
    <Spoiler v-else-if="node.marks?.[0]?.type === 'spoiler'">
      <GalgameDownloadsGameNote :nodes="inner(node)" />
    </Spoiler>
    <strong v-else-if="node.marks?.[0]?.type === 'bold'"
      ><GalgameDownloadsGameNote :nodes="inner(node)"
    /></strong>
    <GalgameDownloadsGameNote v-else-if="node.marks?.length" :nodes="inner(node)" />
    <template v-else>{{ node.text }}</template>
  </template>
</template>

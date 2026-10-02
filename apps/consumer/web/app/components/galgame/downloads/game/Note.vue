<script setup lang="ts">
  import { parse, type TagNode } from '@bbob/parser'
  import { Blockquote, Link, Spoiler } from '@hina-ui/vue'

  type NoteNode = string | TagNode

  defineOptions({ name: 'GalgameDownloadsGameNote' })
  const props = defineProps<{ source?: string; nodes?: NoteNode[] }>()

  const items = computed(
    () =>
      props.nodes ??
      (parse(props.source ?? '', {
        onlyAllowTags: ['b', 'i', 'u', 's', 'url', 'quote', 'spoiler', 'mask'],
      }) as NoteNode[]),
  )

  const children = (node: TagNode) => (node.content ?? []) as NoteNode[]
  const href = (node: TagNode) => {
    const url = (Object.keys(node.attrs)[0] ?? children(node).join('')).trim()
    return /^https?:\/\//i.test(url) ? url : undefined
  }
</script>

<template>
  <template v-for="(node, index) in items" :key="index">
    <template v-if="typeof node === 'string'">{{ node }}</template>
    <Link
      v-else-if="node.tag === 'url' && href(node)"
      :href="href(node)"
      target="_blank"
      rel="noreferrer"
      class="break-all"
    >
      <GalgameDownloadsGameNote :nodes="children(node)" />
    </Link>
    <Spoiler v-else-if="node.tag === 'spoiler' || node.tag === 'mask'">
      <GalgameDownloadsGameNote :nodes="children(node)" />
    </Spoiler>
    <Blockquote v-else-if="node.tag === 'quote'">
      <GalgameDownloadsGameNote :nodes="children(node)" />
    </Blockquote>
    <strong v-else-if="node.tag === 'b'"
      ><GalgameDownloadsGameNote :nodes="children(node)"
    /></strong>
    <em v-else-if="node.tag === 'i'"><GalgameDownloadsGameNote :nodes="children(node)" /></em>
    <u v-else-if="node.tag === 'u'"><GalgameDownloadsGameNote :nodes="children(node)" /></u>
    <s v-else-if="node.tag === 's'"><GalgameDownloadsGameNote :nodes="children(node)" /></s>
  </template>
</template>

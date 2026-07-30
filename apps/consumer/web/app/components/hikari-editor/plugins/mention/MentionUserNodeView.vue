<script setup lang="ts">
  import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'
  import HikariContentNodesMention from '~/components/hikari-content/nodes/Mention.vue'

  defineOptions({ name: 'HikariEditorPluginsMentionUserNodeView' })

  const props = defineProps(nodeViewProps)

  const adaptedNode = computed(() => ({
    type: props.node.type.name,
    attrs: props.node.attrs,
  }))
</script>

<template>
  <NodeViewWrapper
    as="span"
    :class="[
      'inline-flex align-middle',
      selected && 'rounded-full outline outline-2 -outline-offset-1 outline-(--editor-focus-ring)',
    ]"
  >
    <HikariContentNodesMention :node="adaptedNode" />
  </NodeViewWrapper>
</template>

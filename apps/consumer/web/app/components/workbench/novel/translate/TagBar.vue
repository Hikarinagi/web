<script setup lang="ts">
  import { Button, Inline, Text } from '@hina-ui/vue'
  import { SOURCE_TAG_LABEL } from '~/features/workbench/labels'
  import type { BackendNovelSegment } from '~/features/workbench/workbench'

  const props = defineProps<{ source: string; tags: BackendNovelSegment['tags'] }>()
  const emit = defineEmits<{ insert: [open: string, close: string] }>()

  const items = computed(() =>
    props.tags.map(tag => {
      const paired = props.source.includes(`{/${tag.id}}`)
      return {
        ...tag,
        open: paired ? `{${tag.id}}` : `{${tag.id}/}`,
        close: paired ? `{/${tag.id}}` : '',
      }
    }),
  )
</script>

<template>
  <Inline gap="xs" align="center" @mousedown.prevent>
    <Button
      v-for="item in items"
      :key="item.id"
      size="sm"
      variant="soft"
      tone="neutral"
      @click="emit('insert', item.open, item.close)"
    >
      <Text as="span" size="sm" class="font-mono">{{ item.open }}{{ item.close }}</Text>
      <Text as="span" size="xs" tone="muted">{{ SOURCE_TAG_LABEL[item.kind] }}</Text>
    </Button>
  </Inline>
</template>

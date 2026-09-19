<script setup lang="ts">
  import { CodeBlock } from '@hina-ui/vue'
  import { useGuideData } from '~/features/developer/guideContext'

  defineOptions({ name: 'GuideSnippet' })
  const props = defineProps<{ name: string }>()

  const data = useGuideData()
  const snippet = computed(() => {
    const snippets: Record<string, { code: string; html: string }> = data.value?.snippets ?? {}
    return snippets[props.name]
  })
</script>

<template>
  <CodeBlock v-if="snippet" :code="snippet.code" :html="snippet.html" />
</template>

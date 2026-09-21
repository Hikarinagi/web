<script setup lang="ts">
  import { Code, CodeBlock } from '@hina-ui/vue'
  import { useGuideData } from '~/features/developer/guideContext'

  defineOptions({ name: 'GuideValue' })
  const props = defineProps<{ field: 'issuer' | 'discovery_endpoint'; block?: boolean }>()

  const data = useGuideData()
  const value = computed(() => data.value?.[props.field] ?? '')
</script>

<template>
  <CodeBlock v-if="block" :code="value" />
  <Code v-else class="break-all">{{ value }}</Code>
</template>

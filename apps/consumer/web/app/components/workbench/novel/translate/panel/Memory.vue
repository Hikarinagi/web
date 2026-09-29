<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  const props = defineProps<{ segmentId: string }>()
  const emit = defineEmits<{ useText: [text: string] }>()

  const matches = ref<ApiData<'/api/v3/novel-segments/{segment_id}/memory', 'get'>>([])

  watch(
    () => props.segmentId,
    async id => {
      matches.value = []
      const result = await hikariRequest('/api/v3/novel-segments/{segment_id}/memory', {
        path: { segment_id: id },
        toast: false,
      }).catch(() => [])
      if (props.segmentId === id) matches.value = result
    },
    { immediate: true },
  )
</script>

<template>
  <Stack v-if="matches.length" gap="sm">
    <Heading :level="3" size="sm">翻译记忆</Heading>
    <Stack v-for="(match, index) in matches" :key="index" gap="xs">
      <Inline gap="xs" align="center">
        <Tag size="sm" :tone="match.score >= 0.9 ? 'success' : 'neutral'">
          {{ Math.round(match.score * 100) }}%
        </Tag>
        <Tag v-if="match.same_series" size="sm" variant="outline">本系列</Tag>
      </Inline>
      <Text size="sm" tone="muted">{{ match.source_text }}</Text>
      <WorkbenchMarkupText :text="match.target_text" />
      <Inline justify="end">
        <Button size="sm" variant="ghost" @click="emit('useText', match.target_text)">引用</Button>
      </Inline>
    </Stack>
  </Stack>
</template>

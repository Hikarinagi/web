<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import type { ApiData } from '@hikarinagi/api-contract/v3'

  const props = defineProps<{ segmentId: string }>()

  const revisions = ref<ApiData<'/api/v3/novel-segments/{segment_id}/revisions', 'get'>>([])

  watch(
    () => props.segmentId,
    async id => {
      revisions.value = await hikariRequest('/api/v3/novel-segments/{segment_id}/revisions', {
        path: { segment_id: id },
        toast: false,
      }).catch(() => [])
    },
    { immediate: true },
  )
</script>

<template>
  <Text v-if="!revisions.length" size="sm" tone="muted">尚无修订历史。</Text>
  <Stack v-else gap="none" class="divide-y divide-line">
    <Stack v-for="revision in revisions" :key="revision.id" gap="none">
      <Stack gap="xs" class="py-2">
        <Inline gap="xs" align="center">
          <UserName :user="revision.editor" :handle="false" class="text-sm" />
          <Text size="xs" tone="muted">
            {{ timeFormat(revision.created_at) }} · {{ revision.translation_id ? '译文' : '原文' }}
          </Text>
        </Inline>
        <WorkbenchMarkupText :text="revision.text" tagged />
      </Stack>
    </Stack>
  </Stack>
</template>

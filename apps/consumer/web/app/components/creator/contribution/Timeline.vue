<script setup lang="ts">
  import { Inline, Stack, Text, Timeline } from '@hina-ui/vue'
  import { timeFormat } from '#imports'
  import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
  import { CHANGE_REQUEST_EVENT_META } from '~/features/creator/labels'

  const props = defineProps<{
    events: BackendChangeRequestDetail['events']
    resourceType: string
  }>()

  const items = computed(() =>
    props.events.map(event => {
      const meta = CHANGE_REQUEST_EVENT_META[event.type]
      return {
        ...event,
        label: meta?.label ?? event.type,
        textTone: meta?.tone ?? ('muted' as const),
        tone: meta?.tone === 'muted' || !meta ? ('neutral' as const) : meta.tone,
      }
    }),
  )
</script>

<template>
  <Timeline :items="items" reverse size="sm" class="text-sm" aria-label="编辑请求时间线">
    <template #content="{ item }">
      <Stack gap="sm" class="pb-2">
        <Inline gap="sm" align="center">
          <template v-if="item.actor">
            <Avatar :user="item.actor" card class="size-5!" />
            <UserName :user="item.actor" class="font-medium" />
          </template>
          <Text v-else as="span" weight="medium" tone="muted">系统</Text>
          <Text as="span" :tone="item.textTone">{{ item.label }}</Text>
          <Text as="span" size="xs" tone="muted">{{ timeFormat(item.created_at) }}</Text>
        </Inline>
        <Text v-if="item.body" class="whitespace-pre-wrap">{{ item.body }}</Text>
        <CreatorChangesetView
          v-if="item.payload && item.payload.length"
          :payload="item.payload"
          :resource-type="resourceType"
        />
      </Stack>
    </template>
  </Timeline>
</template>

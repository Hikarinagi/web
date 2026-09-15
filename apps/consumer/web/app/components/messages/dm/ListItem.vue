<script setup lang="ts">
  import { Badge, Card, Inline, Ripple, Stack, Text, Time } from '@hina-ui/vue'
  import type { Conversation } from '~/features/messages/dm'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'MessagesDmListItem' })
  defineProps<{ conversation: Conversation; active: boolean }>()
</script>

<template>
  <Card
    as="button"
    :padded="false"
    :class="
      cn(
        'hn-state-layer flex w-full hn-interactive items-center gap-3 rounded-none border-0 px-4 py-3 text-left shadow-none hn-press-none',
        active ? 'bg-accent-soft' : 'bg-transparent',
      )
    "
  >
    <Ripple />
    <Badge :content="conversation.unread_count || null" shape="circle">
      <Avatar :user="conversation.peer" class="size-11!" />
    </Badge>
    <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
      <Inline gap="sm">
        <UserName
          :user="conversation.peer"
          :handle="false"
          class="truncate text-sm font-semibold text-fg"
        />
        <Time
          v-if="conversation.last_message"
          :value="conversation.last_message.sent_at"
          format="relative"
          class="ml-auto shrink-0 text-xs text-muted"
        />
      </Inline>
      <Text as="p" size="xs" tone="muted" truncate>
        <Text v-if="conversation.last_message?.from_me" as="span" size="xs" tone="faint">我：</Text>
        {{ conversation.last_message?.excerpt ?? '还没有消息' }}
      </Text>
    </Stack>
  </Card>
</template>

<script setup lang="ts">
  import type { Conversation } from '~/features/messages/dm'
  import { timeFromNow } from '~/utils/time-format'

  defineOptions({ name: 'MessagesDmListItem' })
  defineProps<{ conversation: Conversation; active: boolean }>()
</script>

<template>
  <Button
    unstyled
    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors"
    :class="active ? 'bg-primary/10' : 'hover:bg-surface-100 dark:hover:bg-surface-800/60'"
  >
    <OverlayBadge
      severity="danger"
      :value="conversation.unread_count > 99 ? '99+' : String(conversation.unread_count)"
      class="shrink-0"
      :pt="{
        pcBadge: { root: { class: conversation.unread_count === 0 ? 'hidden!' : undefined } },
      }"
    >
      <Avatar :user="conversation.peer" shape="circle" class="size-11!" />
    </OverlayBadge>
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <div class="flex items-center gap-2">
        <UserName
          :user="conversation.peer"
          :handle="false"
          class="truncate text-sm font-semibold text-color"
        />
        <span
          v-if="conversation.last_message"
          class="ml-auto shrink-0 text-[11px] text-muted-color"
        >
          {{ timeFromNow(conversation.last_message.sent_at) }}
        </span>
      </div>
      <p class="truncate text-[13px] text-muted-color">
        <span
          v-if="conversation.last_message?.from_me"
          class="text-surface-400 dark:text-surface-500"
        >
          我:
        </span>
        {{ conversation.last_message?.excerpt ?? '还没有消息' }}
      </p>
    </div>
  </Button>
</template>

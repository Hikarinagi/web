<script setup lang="ts">
  import type { Conversation, DmPeer } from '~/features/messages/dm'

  defineOptions({ name: 'MessagesDmList' })
  defineProps<{ items: Conversation[]; pending: boolean; activePeerId: number | null }>()
  defineEmits<{ open: [peer: DmPeer] }>()
</script>

<template>
  <div class="flex flex-col">
    <ScrollArea class="min-h-0 flex-1">
      <slot />

      <template v-if="items.length">
        <MessagesDmListItem
          v-for="c in items"
          :key="c.peer.id"
          :conversation="c"
          :active="c.peer.id === activePeerId"
          @click="$emit('open', c.peer)"
        />
      </template>

      <div v-else-if="pending" class="flex flex-col gap-2 p-3">
        <Skeleton v-for="i in 7" :key="i" height="3.25rem" border-radius="0.5rem" />
      </div>

      <div v-else class="flex flex-col items-start gap-1 px-4 py-8">
        <p class="text-sm font-medium text-color">还没有私信</p>
        <p class="text-[13px] text-muted-color">在其他用户的空间点击「私信」开始吧</p>
      </div>
    </ScrollArea>
  </div>
</template>

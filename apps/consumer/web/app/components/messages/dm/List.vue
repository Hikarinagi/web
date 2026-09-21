<script setup lang="ts">
  import { ScrollArea, Skeleton, Stack, Text } from '@hina-ui/vue'
  import type { Conversation, DmPeer } from '~/features/messages/dm'

  defineOptions({ name: 'MessagesDmList' })
  defineProps<{ items: Conversation[]; pending: boolean; activePeerId: number | null }>()
  defineEmits<{ open: [peer: DmPeer] }>()
</script>

<template>
  <Stack gap="none">
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

      <Stack v-else-if="pending" gap="sm" class="p-3">
        <Skeleton v-for="i in 7" :key="i" class="h-13 rounded-lg" />
      </Stack>

      <Stack v-else gap="xs" align="start" class="px-4 py-8">
        <Text as="p" size="sm" weight="medium">还没有私信</Text>
        <Text as="p" size="xs" tone="muted">在其他用户的空间点击「私信」开始吧</Text>
      </Stack>
    </ScrollArea>
  </Stack>
</template>

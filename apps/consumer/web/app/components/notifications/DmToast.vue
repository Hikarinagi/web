<script setup lang="ts">
  import { Button, Inline, Text, toast } from '@hina-ui/vue'
  import type { DmPeer } from '~/features/messages/dm'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'NotificationsDmToast' })
  const props = defineProps<{ peer: DmPeer; toastId?: number | string }>()

  function openChat() {
    void navigateTo(`/messages?peer=${props.peer.id}`)
    toast.dismiss(props.toastId)
  }
</script>

<template>
  <Inline gap="md" class="min-w-64">
    <Avatar :user="peer" class="size-9! shrink-0" />
    <Inline as="p" gap="xs" align="baseline" class="min-w-0 flex-1 text-sm">
      <Text as="span" weight="semibold" truncate>{{ displayName(peer) }}</Text>
      <Text as="span" class="shrink-0">给你发了一条私信</Text>
    </Inline>
    <Button size="sm" class="shrink-0" @click="openChat">查看</Button>
  </Inline>
</template>

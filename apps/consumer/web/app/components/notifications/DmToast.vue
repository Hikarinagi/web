<script setup lang="ts">
  import { Button, Card, Inline, Text } from '@hina-ui/vue'
  import type { NotivueItem } from 'notivue'
  import type { DmPeer } from '~/features/messages/dm'
  import { displayName } from '~/utils/user'

  defineOptions({ name: 'NotificationsDmToast' })
  const props = defineProps<{ item: NotivueItem }>()

  const peer = computed(() => (props.item.props as { peer: DmPeer }).peer)

  function openChat() {
    void navigateTo(`/messages?peer=${peer.value.id}`)
    props.item.clear()
  }
</script>

<template>
  <Card :padded="false" class="hn-scrollbar-safe min-w-72 rounded-xl p-3 shadow-lg">
    <Inline gap="md">
      <Avatar :user="peer" shape="circle" class="size-9! shrink-0" />
      <Inline as="p" gap="xs" align="baseline" class="min-w-0 flex-1 text-sm">
        <Text as="span" weight="semibold" truncate>{{ displayName(peer) }}</Text>
        <Text as="span" class="shrink-0">给你发了一条私信</Text>
      </Inline>
      <Button size="sm" class="shrink-0" @click="openChat">查看</Button>
    </Inline>
  </Card>
</template>

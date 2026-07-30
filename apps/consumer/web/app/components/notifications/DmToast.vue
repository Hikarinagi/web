<script setup lang="ts">
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
  <div
    class="mr-(--p-scrollbar-width) flex min-w-72 items-center gap-3 rounded-xl border border-surface-200 bg-surface-0 p-3 shadow-lg dark:border-surface-700 dark:bg-surface-800"
  >
    <Avatar :user="peer" shape="circle" class="size-9! shrink-0" />
    <p class="flex min-w-0 flex-1 items-baseline gap-1 text-sm text-color">
      <span class="truncate font-semibold">{{ displayName(peer) }}</span>
      <span class="shrink-0">给你发了一条私信</span>
    </p>
    <Button label="查看" size="small" class="shrink-0" @click="openChat" />
  </div>
</template>

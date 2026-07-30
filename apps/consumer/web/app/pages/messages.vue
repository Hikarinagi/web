<script setup lang="ts">
  import type { MessagesPageData } from '~~/server/api/pages/messages.get'
  import { messagesBff, readMessagesQuery } from '~/features/notifications/results'
  import { useDmSurface } from '~/features/messages/useDmSurface'

  defineOptions({ name: 'MessagesPage' })
  definePageMeta({
    middleware: 'auth',
    layout: 'messages',
    footer: false,
    scrollToTop: false,
    floatingToolbar: false,
  })

  const route = useRoute()
  const { selectedPeer, selectedPeerId, thread, back } = useDmSurface()
  const { messages, emojiSets, pending, sending, hasMore, loadingOlder, send, retry, loadOlder } =
    thread

  const { data } = await useHikariApiData<MessagesPageData>(
    messagesBff(readMessagesQuery(route.query)),
    { fatal: true, watch: false },
  )

  const cardClass =
    'overflow-hidden rounded-xl border border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-900'

  useHikariSeoMeta({ title: '消息', description: '通知与私信。', noindex: true })
</script>

<template>
  <MessagesDmThread
    v-if="selectedPeerId != null"
    :class="['h-full', cardClass]"
    :peer="selectedPeer"
    :messages="messages"
    :emoji-sets="emojiSets"
    :pending="pending"
    :sending="sending"
    :has-more="hasMore"
    :loading-older="loadingOlder"
    @send="send"
    @retry="retry"
    @load-older="loadOlder"
    @back="back"
  />

  <NotificationsCenter
    v-else-if="data"
    :class="['h-full', cardClass]"
    :initial="data"
    @back="back"
  />
</template>

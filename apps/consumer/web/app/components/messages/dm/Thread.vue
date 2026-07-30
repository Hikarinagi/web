<script setup lang="ts">
  import type { EditorDocument } from '@hikarinagi/editor-schema'
  import type { MediaValue } from '~/components/media-library/types'
  import type { DmEmojiSet, DmPeer, ThreadMessage } from '~/features/messages/dm'

  defineOptions({ name: 'MessagesDmThread' })
  defineProps<{
    peer: DmPeer | null
    messages: ThreadMessage[]
    emojiSets: DmEmojiSet[]
    pending: boolean
    sending: boolean
    hasMore: boolean
    loadingOlder: boolean
  }>()
  const emit = defineEmits<{
    send: [contentJson: EditorDocument, attachments: MediaValue[], emojiSets: DmEmojiSet[]]
    retry: [message: ThreadMessage]
    loadOlder: []
    back: []
  }>()
</script>

<template>
  <MessagesDmEmpty v-if="!peer" />
  <div v-else class="flex h-full min-h-0 flex-col bg-surface-0 dark:bg-surface-900">
    <MessagesDmThreadHeader :peer="peer" @back="emit('back')" />
    <MessagesDmMessageList
      :messages="messages"
      :emoji-sets="emojiSets"
      :pending="pending"
      :has-more="hasMore"
      :loading-older="loadingOlder"
      :peer-id="peer.id"
      @load-older="emit('loadOlder')"
      @retry="m => emit('retry', m)"
    />
    <MessagesDmComposer
      :sending="sending"
      @send="(json, atts, sets) => emit('send', json, atts, sets)"
    />
  </div>
</template>

<script setup lang="ts">
  import { Stack } from '@hina-ui/vue'
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
  <Stack v-else gap="none" class="h-full min-h-0 bg-surface">
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
  </Stack>
</template>

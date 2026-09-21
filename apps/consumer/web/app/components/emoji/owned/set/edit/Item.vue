<script setup lang="ts">
  import { IconButton, Inline, Skeleton, Text } from '@hina-ui/vue'
  import { MoreHorizontal } from '@lucide/vue'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'

  type Emoji = MyEmojiSet['emojis'][number]

  defineOptions({ name: 'EmojiOwnedSetEditItem' })

  defineProps<{ emoji: Emoji; deleting: boolean }>()
  const emit = defineEmits<{ 'more-click': [event: MouseEvent, id: number] }>()
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="group hn-state-layer rounded-md px-2 py-1.5">
    <HikariImage
      :src="emoji.src?.src"
      :alt="emoji.name"
      :processing="false"
      class="size-8 shrink-0"
      image-class="h-full w-full object-contain"
    >
      <template #skeleton>
        <Skeleton class="size-full rounded-sm" />
      </template>
    </HikariImage>
    <Text as="span" size="sm" truncate class="min-w-0 flex-1 font-mono">{{ emoji.name }}</Text>
    <IconButton
      label="更多操作"
      size="sm"
      pill
      :loading="deleting"
      class="transition-opacity"
      :class="
        deleting
          ? undefined
          : 'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100'
      "
      @click="(event: MouseEvent) => emit('more-click', event, emoji.id)"
    >
      <MoreHorizontal />
    </IconButton>
  </Inline>
</template>

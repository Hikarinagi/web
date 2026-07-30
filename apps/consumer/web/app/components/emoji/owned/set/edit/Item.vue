<script setup lang="ts">
  import { MoreHorizontal } from '@lucide/vue'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'

  type Emoji = MyEmojiSet['emojis'][number]

  defineOptions({ name: 'EmojiOwnedSetEditItem' })

  defineProps<{ emoji: Emoji; deleting: boolean }>()
  const emit = defineEmits<{ 'more-click': [event: MouseEvent, id: number] }>()
</script>

<template>
  <div
    class="group flex items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-100 dark:hover:bg-surface-800"
  >
    <HikariImage
      :src="emoji.src?.src"
      :alt="emoji.name"
      :processing="false"
      class="size-8 shrink-0"
      image-class="h-full w-full object-contain"
    />
    <span class="min-w-0 flex-1 truncate font-mono text-sm">{{ emoji.name }}</span>
    <Button
      aria-label="更多操作"
      severity="secondary"
      variant="text"
      size="small"
      rounded
      :loading="deleting"
      class="transition-opacity"
      :class="{
        'opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100':
          !deleting,
      }"
      @click="event => emit('more-click', event, emoji.id)"
    >
      <template v-if="!deleting" #icon>
        <MoreHorizontal class="size-4" />
      </template>
    </Button>
  </div>
</template>

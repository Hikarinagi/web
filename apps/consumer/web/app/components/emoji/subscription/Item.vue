<script setup lang="ts">
  import { BookmarkX } from '@lucide/vue'
  import type { MyEmojiSubscription } from '~/features/emoji/composables/useMySubscriptions'

  defineOptions({ name: 'EmojiSubscriptionItem' })

  const PREVIEW_LIMIT = 8

  const props = defineProps<{ sub: MyEmojiSubscription; unsubscribing: boolean }>()
  const emit = defineEmits<{ 'unsubscribe-request': [id: number, name: string] }>()

  const preview = computed(() => props.sub.emojis.slice(0, PREVIEW_LIMIT))
  const extraCount = computed(() => Math.max(0, props.sub.emojis.length - PREVIEW_LIMIT))
</script>

<template>
  <Card :pt="{ body: { class: 'p-4!' }, content: { class: 'p-0!' } }">
    <template #content>
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between gap-3">
          <div class="flex min-w-0 flex-col gap-1">
            <div class="flex items-center gap-2">
              <span class="truncate font-mono text-sm font-semibold">{{ sub.name }}</span>
              <Tag
                v-if="!sub.subscribable"
                value="已下架"
                severity="warn"
                :pt="{ root: { class: 'text-[10px]!' } }"
              />
            </div>
            <p class="text-xs text-muted-color">{{ sub.emojis.length }} 个贴纸</p>
          </div>
          <Button
            severity="danger"
            variant="text"
            size="small"
            label="取消订阅"
            :loading="unsubscribing"
            @click="emit('unsubscribe-request', sub.id, sub.name)"
          >
            <template v-if="!unsubscribing" #icon>
              <BookmarkX class="size-4" />
            </template>
          </Button>
        </div>

        <div v-if="preview.length > 0" class="flex flex-wrap items-center gap-1.5">
          <HikariImage
            v-for="emoji in preview"
            :key="emoji.id"
            v-tooltip.top="`:${emoji.name}:`"
            :src="emoji.src?.src"
            :alt="emoji.name"
            :processing="false"
            class="size-6"
            image-class="h-full w-full object-contain"
          />
          <span v-if="extraCount > 0" class="text-xs text-muted-color">+{{ extraCount }}</span>
        </div>
      </div>
    </template>
  </Card>
</template>

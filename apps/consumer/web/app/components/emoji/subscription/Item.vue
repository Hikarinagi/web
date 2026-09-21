<script setup lang="ts">
  import { Button, Card, Inline, Stack, Tag, Text } from '@hina-ui/vue'
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
  <Card>
    <Stack gap="sm">
      <Inline gap="sm" align="center" justify="between" :wrap="false">
        <Stack gap="xs" class="min-w-0">
          <Inline gap="sm" align="center">
            <Text as="span" size="sm" weight="semibold" truncate class="font-mono">
              {{ sub.name }}
            </Text>
            <Tag v-if="!sub.subscribable" tone="warning" size="sm">已下架</Tag>
          </Inline>
          <Text as="p" size="xs" tone="muted">{{ sub.emojis.length }} 个贴纸</Text>
        </Stack>
        <Button
          variant="ghost"
          tone="danger"
          size="sm"
          :loading="unsubscribing"
          class="shrink-0"
          @click="emit('unsubscribe-request', sub.id, sub.name)"
        >
          <template #icon><BookmarkX /></template>
          取消订阅
        </Button>
      </Inline>

      <Inline v-if="preview.length > 0" gap="xs" align="center" wrap>
        <HikariImage
          v-for="emoji in preview"
          :key="emoji.id"
          v-tooltip="`:${emoji.name}:`"
          :src="emoji.src?.src"
          :alt="emoji.name"
          :processing="false"
          class="size-6"
          image-class="h-full w-full object-contain"
        />
        <Text v-if="extraCount > 0" as="span" size="xs" tone="muted">+{{ extraCount }}</Text>
      </Inline>
    </Stack>
  </Card>
</template>

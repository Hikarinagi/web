<script setup lang="ts">
  import { Inline, Stack, Tag, Text } from '@hina-ui/vue'

  defineOptions({ name: 'EmojiOwnedSetHeader' })

  defineProps<{
    name: string
    visibilityPublic: boolean
    emojiCount: number
    subscriberCount: number
  }>()
</script>

<template>
  <Stack gap="xs" class="min-w-0">
    <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
      <Text as="span" size="sm" weight="semibold" truncate class="min-w-0 font-mono">
        {{ name }}
      </Text>
      <Tag size="sm" :tone="visibilityPublic ? 'success' : 'neutral'" class="shrink-0">
        {{ visibilityPublic ? '公开' : '私有' }}
      </Tag>
    </Inline>
    <Text size="xs" tone="muted">{{ emojiCount }} 个贴纸 · {{ subscriberCount }} 人订阅</Text>
  </Stack>
</template>

<script setup lang="ts">
  import { Blockquote, Inline, Stack, Text } from '@hina-ui/vue'
  import { accessedText } from '~/features/creator/entry/values'

  defineOptions({ name: 'CreatorEntryFormSourceCard' })
  defineProps<{
    name: string | null
    accessed?: string | null
    title?: string | null
    excerpt?: string | null
  }>()
</script>

<template>
  <Stack gap="sm" class="rounded-md bg-subtle p-3">
    <Stack gap="xs">
      <Inline gap="md" align="center" justify="between">
        <Text as="span" size="sm" weight="medium" class="min-w-0 break-all">{{ name }}</Text>
        <Text
          v-if="accessedText(accessed ?? null)"
          as="span"
          size="xs"
          tone="muted"
          class="shrink-0"
        >
          访问于 {{ accessedText(accessed ?? null) }}
        </Text>
      </Inline>
      <Text v-if="title" as="span" size="sm" lang="ja">{{ title }}</Text>
    </Stack>
    <Stack v-if="excerpt" gap="xs">
      <Text as="span" size="xs" tone="muted">摘录</Text>
      <Blockquote class="text-sm whitespace-pre-line" lang="ja">{{ excerpt }}</Blockquote>
    </Stack>
    <slot />
  </Stack>
</template>

<script setup lang="ts">
  import { IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { Pencil, Vote, X } from '@lucide/vue'
  import type { PollNodeAttrs } from '@hikarinagi/editor-schema'

  defineOptions({ name: 'FeedComposerPollAttachment' })

  defineProps<{ poll: PollNodeAttrs }>()
  const emit = defineEmits<{ edit: []; remove: [] }>()
</script>

<template>
  <Stack gap="none" class="px-4 pt-1 pb-2 pl-16">
    <Inline gap="sm" :wrap="false" class="rounded-lg bg-subtle px-3 py-1.5">
      <Vote class="size-4 shrink-0 text-muted" />
      <Text as="span" size="sm" truncate class="min-w-0 flex-1">
        {{ poll.question }}
        <Text as="span" size="sm" tone="muted">· {{ poll.options.length }} 个选项</Text>
      </Text>
      <IconButton label="编辑投票" size="sm" class="shrink-0" @click="emit('edit')">
        <Pencil />
      </IconButton>
      <IconButton label="移除投票" tone="danger" size="sm" class="shrink-0" @click="emit('remove')">
        <X />
      </IconButton>
    </Inline>
  </Stack>
</template>

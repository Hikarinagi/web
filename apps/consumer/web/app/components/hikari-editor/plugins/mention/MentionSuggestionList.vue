<script setup lang="ts">
  import { Card, Center, Empty, Inline, ScrollArea, Skeleton, Stack, Text } from '@hina-ui/vue'
  import type { MentionUser } from './composables/useMentionSuggestion'

  defineOptions({ name: 'HikariEditorPluginsMentionSuggestionList' })

  const props = defineProps<{
    items: MentionUser[]
    loading: boolean
    resolved: boolean
    query: string
    highlighted: number
  }>()
  const emit = defineEmits<{ select: [index: number]; highlight: [index: number] }>()

  const pending = computed(() => props.loading || (!!props.query && !props.resolved))
</script>

<template>
  <Stack v-if="pending" gap="xs" class="w-72 p-1">
    <Inline v-for="i in 3" :key="i" :wrap="false" gap="sm" align="center" class="px-2 py-1.5">
      <Skeleton class="size-6 rounded-full" />
      <Skeleton class="h-3.5 w-3/5 rounded-sm" />
    </Inline>
  </Stack>

  <Center v-else-if="!items.length" class="w-72 px-3 py-4">
    <Empty size="sm" :title="query ? '未找到匹配用户' : '输入用户名搜索'" />
  </Center>

  <ScrollArea v-else class="max-h-72 w-72">
    <Stack gap="none" class="p-1">
      <Card
        v-for="(item, index) in items"
        :key="item.id"
        as="button"
        type="button"
        :padded="false"
        :class="
          cn(
            'hn-state-layer flex w-full hn-interactive items-center gap-2 hn-press-none',
            'rounded-md border-0 px-2 py-1.5 text-start shadow-none',
            index === highlighted ? 'bg-accent-soft text-accent-text' : 'bg-transparent',
          )
        "
        @mousedown.prevent
        @click="emit('select', index)"
        @mouseenter="emit('highlight', index)"
      >
        <Avatar :user="item" size="sm" class="shrink-0" />
        <Text as="span" size="sm" weight="medium" truncate class="min-w-0 flex-1">
          @{{ item.name }}
        </Text>
      </Card>
    </Stack>
  </ScrollArea>
</template>

<script setup lang="ts">
  import { Checkbox, Inline, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { changeLines, changeTitle, type WikiChange } from '~/features/wiki/changes'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiChangesItem' })

  const props = defineProps<{
    change: WikiChange
    to: string
    active?: boolean
    selectable?: boolean
  }>()
  const selected = defineModel<boolean>('selected', { default: false })

  const title = computed(() => changeTitle(props.change))
  const summary = computed(
    () =>
      props.change.note ??
      changeLines(props.change)
        .map(line => (line.entry ? `${line.entry}：${line.text}` : line.text))
        .join('；'),
  )
</script>

<template>
  <Inline
    gap="sm"
    align="start"
    :wrap="false"
    :class="cn('border-b border-line px-4 py-3', active ? 'bg-accent-soft' : 'hover:bg-subtle')"
  >
    <Checkbox v-if="selectable" v-model="selected" :aria-label="title" class="mt-0.5" />
    <Stack :as="NuxtLink" :to="to" gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center" justify="between" :wrap="false" class="min-w-0">
        <Inline gap="xs" align="center" :wrap="false" class="min-w-0">
          <Avatar :user="change.editor" size="sm" />
          <UserName :user="change.editor" class="text-xs" />
        </Inline>
        <Inline gap="sm" align="center" :wrap="false" class="shrink-0">
          <Text v-if="change.patrolled_at" as="span" size="xs" tone="success">已检查</Text>
          <Text v-if="change.reverted_at" as="span" size="xs" tone="muted">已撤销</Text>
          <Text as="span" size="xs" tone="muted">{{ revisionTime(change.created_at) }}</Text>
        </Inline>
      </Inline>
      <Text size="sm" lang="ja" truncate>{{ title }}</Text>
      <Text size="xs" tone="muted" class="line-clamp-2">{{ summary }}</Text>
    </Stack>
  </Inline>
</template>

<script setup lang="ts">
  import {
    Button,
    Center,
    Checkbox,
    IconButton,
    Inline,
    Stack,
    Tag,
    Text,
    Time,
  } from '@hina-ui/vue'
  import { Eye, GitCompare } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendEntryHistory } from '~/features/entry/contract'
  import { titleText } from '~/features/entry/labels'

  defineOptions({ name: 'EntryHistoryRow' })
  const props = defineProps<{
    row: BackendEntryHistory['items'][number]
    to: string
    snapshots: boolean
    selected: boolean
  }>()
  defineEmits<{ toggle: [on: boolean] }>()

  const link = computed(() => {
    const { revision, previous } = props.row
    if (revision === null) return null
    if (props.snapshots)
      return { to: `${props.to}/revisions/${revision}`, label: '查看此修订下的条目', icon: Eye }
    if (previous === null) return null
    return {
      to: `${props.to}/revisions/compare?from=${previous}&to=${revision}`,
      label: '查看此次修改',
      icon: GitCompare,
    }
  })
</script>

<template>
  <Inline :wrap="false" align="start" gap="md" class="px-4 py-5 sm:px-5">
    <Center class="h-6 w-5 shrink-0">
      <Checkbox
        v-if="row.revision !== null"
        :model-value="selected"
        aria-label="选择此修订"
        @update:model-value="value => $emit('toggle', value === true)"
      />
    </Center>
    <Stack gap="sm" class="min-w-0 flex-1">
      <Stack gap="xs">
        <Inline gap="sm" align="center">
          <Text
            weight="medium"
            :tone="row.reverted ? 'muted' : undefined"
            :class="row.reverted ? 'line-through' : undefined"
          >
            {{ row.summary }}
          </Text>
          <Tag v-if="row.reverted" tone="neutral" size="sm">已撤销</Tag>
        </Inline>
        <Text v-if="row.note" size="sm" tone="muted">{{ row.note }}</Text>
      </Stack>
      <Inline gap="none" align="center" class="gap-x-4 gap-y-2 text-sm text-muted">
        <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
          <Avatar :user="row.editor" size="sm" />
          <UserName :user="row.editor" />
        </Inline>
        <Time :value="row.created_at" format="time" class="tabular-nums" />
        <Inline
          v-if="row.entries.length"
          gap="none"
          align="center"
          class="min-w-0 gap-x-1.5 gap-y-2"
        >
          <Tag
            v-for="entry in row.entries.slice(0, 3)"
            :key="entry.id"
            tone="neutral"
            size="sm"
            class="max-w-full"
          >
            <Text as="span" size="inherit" truncate>{{ titleText(entry.title) }}</Text>
          </Tag>
          <Text v-if="row.entries.length > 3" as="span" size="sm" tone="muted">
            等 {{ row.entries.length - 3 }} 个
          </Text>
        </Inline>
      </Inline>
    </Stack>
    <template v-if="link">
      <Button
        :as="NuxtLink"
        :to="link.to"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="hidden self-center sm:inline-flex"
      >
        <template #icon><component :is="link.icon" /></template>
        {{ link.label }}
      </Button>
      <IconButton
        :as="NuxtLink"
        :to="link.to"
        :label="link.label"
        variant="ghost"
        tone="neutral"
        size="sm"
        class="self-center sm:hidden"
      >
        <component :is="link.icon" />
      </IconButton>
    </template>
  </Inline>
</template>

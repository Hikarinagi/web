<script setup lang="ts">
  import { Checkbox, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { revisionTime } from '~/features/entry/time'
  import { changeLines, type WikiChange } from '~/features/wiki/changes'
  import { versionName } from '~/features/wiki/history'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiHistoryRow' })

  const props = defineProps<{ change: WikiChange; entry: number }>()
  const selected = defineModel<boolean>('selected', { default: false })

  const part = computed(() => props.change.entries.find(item => item.id === props.entry))
  const reverted = computed(() => !!(props.change.reverted_at || part.value?.reverted_at))
  const summary = computed(() =>
    changeLines(props.change)
      .map(line => (line.entry ? `${line.entry}：${line.text}` : line.text))
      .join('；'),
  )
</script>

<template>
  <Inline gap="md" align="start" :wrap="false" class="px-(--hn-panel-p) py-3">
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Avatar :user="change.editor" size="sm" />
        <UserName :user="change.editor" class="text-sm" />
        <Text as="span" size="sm" tone="muted" class="shrink-0">
          {{ revisionTime(change.created_at) }}
        </Text>
        <Tag v-if="reverted" size="sm" tone="neutral">已撤销</Tag>
        <Tag v-else-if="change.patrolled_at" size="sm" tone="success">已检查</Tag>
      </Inline>
      <Text v-if="change.note" size="sm">{{ change.note }}</Text>
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Checkbox
          v-if="part?.revision"
          v-model="selected"
          :aria-label="`选中${versionName(change.created_at)}`"
        />
        <Link
          v-if="part?.revision"
          :as="NuxtLink"
          :to="`/entries/${entry}/history/${part.revision}`"
          :class="cn('min-w-0 truncate text-sm', reverted && 'text-muted line-through')"
          lang="ja"
        >
          {{ summary }}
        </Link>
        <Text v-else as="span" size="sm" tone="muted" lang="ja" truncate>{{ summary }}</Text>
      </Inline>
    </Stack>
    <Link :as="NuxtLink" :to="`/create/wiki/changes/${change.id}`" class="shrink-0 text-sm">
      修改详情
    </Link>
  </Inline>
</template>

<script setup lang="ts">
  import { Center, Checkbox, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { changeLines, type WikiChange } from '~/features/wiki/changes'
  import { versionName } from '~/features/wiki/history'

  defineOptions({ name: 'WikiHistoryRow' })

  const props = defineProps<{ change: WikiChange; entry: number }>()
  const selected = defineModel<boolean>('selected', { default: false })

  const part = computed(() => props.change.entries.find(item => item.id === props.entry))
  const others = computed(() =>
    props.change.entries
      .filter(item => item.id !== props.entry)
      .map(item => item.label || '未命名')
      .join('、'),
  )
  const text = computed(
    () =>
      props.change.note ??
      changeLines(props.change)
        .map(line => (line.entry ? `${line.entry}：${line.text}` : line.text))
        .join('；'),
  )
</script>

<template>
  <Inline gap="sm" align="start" :wrap="false" class="px-(--hn-panel-p) py-3">
    <Center class="mt-1 w-4 shrink-0">
      <Checkbox
        v-if="part?.revision"
        v-model="selected"
        :aria-label="versionName(change.created_at)"
      />
    </Center>
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
        <Avatar :user="change.editor" size="sm" />
        <UserName :user="change.editor" class="text-sm" />
        <Tag v-if="change.reverted_at || part?.reverted_at" size="sm" tone="neutral">已撤销</Tag>
        <Tag v-else-if="change.patrolled_at" size="sm" tone="success">已检查</Tag>
      </Inline>
      <Text size="sm">{{ text }}</Text>
      <Inline gap="md">
        <Link
          v-if="part?.revision"
          :as="NuxtLink"
          :to="`/entries/${entry}/history/${part.revision}`"
          class="text-sm"
        >
          {{ versionName(change.created_at) }}
        </Link>
        <Text v-else as="span" size="sm" tone="muted" truncate>{{ others }}</Text>
        <Link :as="NuxtLink" :to="`/create/wiki/changes/${change.id}`" class="text-sm">
          修改详情
        </Link>
      </Inline>
    </Stack>
  </Inline>
</template>

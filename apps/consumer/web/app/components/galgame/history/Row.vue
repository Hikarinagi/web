<script setup lang="ts">
  import {
    Button,
    Checkbox,
    IconButton,
    Inline,
    Stack,
    TableCell,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ChevronDown, ChevronUp, Eye } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgameHistoryPageData } from '~~/server/api/pages/galgames/[id]/revisions/index.get'
  import { titleText } from '~/features/entry/labels'
  import { revisionTime } from '~/features/entry/time'

  defineOptions({ name: 'GalgameHistoryRow' })
  defineProps<{
    row: GalgameHistoryPageData['history']['items'][number]
    galgameId: number
    selected: boolean
  }>()
  defineEmits<{ toggle: [on: boolean] }>()

  const expanded = ref(false)
</script>

<template>
  <TableRow class="align-top">
    <TableCell>
      <Checkbox
        v-if="row.revision !== null"
        :model-value="selected"
        aria-label="选择此修订"
        @update:model-value="value => $emit('toggle', value === true)"
      />
    </TableCell>
    <TableCell class="whitespace-nowrap text-muted">{{ revisionTime(row.created_at) }}</TableCell>
    <TableCell class="whitespace-nowrap">
      <Inline gap="sm" align="center" :wrap="false">
        <Avatar :user="row.editor" class="size-6!" />
        <UserName :user="row.editor" class="min-w-0 text-sm" />
      </Inline>
    </TableCell>
    <TableCell>
      <Stack gap="xs">
        <Inline gap="sm" align="center">
          <Text
            as="span"
            size="sm"
            :tone="row.reverted ? 'muted' : undefined"
            :class="row.reverted ? 'line-through' : undefined"
          >
            {{ row.summary }}
          </Text>
          <Tag v-if="row.reverted" tone="neutral">已撤销</Tag>
        </Inline>
        <Text v-if="row.note" as="span" size="xs" tone="muted">{{ row.note }}</Text>
        <Inline v-if="row.edits.length > 1" gap="sm" align="center">
          <Text as="span" size="xs" tone="muted"
            >{{ row.edits.length }} 次编辑在同一批次中完成</Text
          >
          <Button variant="ghost" tone="neutral" size="xs" @click="expanded = !expanded">
            <template #trailing>
              <ChevronUp v-if="expanded" />
              <ChevronDown v-else />
            </template>
            {{ expanded ? '收起' : '展开' }}
          </Button>
        </Inline>
      </Stack>
    </TableCell>
    <TableCell>
      <IconButton
        v-if="row.revision !== null"
        :as="NuxtLink"
        :to="`/galgames/${galgameId}/revisions/${row.revision}`"
        label="查看此修订下的条目"
        variant="ghost"
        tone="neutral"
        size="sm"
      >
        <Eye />
      </IconButton>
    </TableCell>
  </TableRow>
  <template v-if="expanded">
    <TableRow v-for="edit in row.edits" :key="edit.id" class="bg-subtle">
      <TableCell />
      <TableCell class="text-xs whitespace-nowrap text-muted">{{
        revisionTime(edit.created_at)
      }}</TableCell>
      <TableCell class="text-xs text-muted">{{
        edit.entries.map(entry => titleText(entry.title)).join('、')
      }}</TableCell>
      <TableCell class="text-xs">{{ edit.summary }}</TableCell>
      <TableCell />
    </TableRow>
  </template>
</template>

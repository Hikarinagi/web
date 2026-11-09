<script setup lang="ts">
  import {
    Button,
    DropdownMenu,
    DropdownMenuItem,
    Empty,
    IconButton,
    Inline,
    Link,
    Panel,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { Ellipsis, Plus, Undo2 } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useEntryLinks } from '~/features/wiki/composables/useEntryLinks'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import type { RelationRow, RelationSide } from '~/features/wiki/editor/relations'
  import type { EditorPanel } from '~/features/wiki/editor/route'
  import { qualifierText } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiOrganizationLinks' })

  const props = defineProps<{
    entry: EditableEntry
    title: string
    noun: string
    property: 'PARENT' | 'MEMBER'
    side: RelationSide
    panel: EditorPanel
    base: string
  }>()
  const route = useRoute()
  const links = useEntryLinks(() => props.entry, props.property, props.side)
  const rows = computed(() =>
    [...links.rows.value].sort((a, b) =>
      a.other.label < b.other.label ? -1 : a.other.label > b.other.label ? 1 : 0,
    ),
  )
  const live = computed(() => rows.value.filter(row => row.state !== 'removed').length)
  const editing = ref<RelationRow | null>(null)
  const open = computed({
    get: () => editing.value !== null,
    set: next => {
      if (!next) editing.value = null
    },
  })
  const TONE: Record<RelationRow['state'], string> = {
    same: '',
    added: 'bg-success-soft',
    changed: 'bg-accent-soft',
    flipped: 'bg-accent-soft',
    removed: 'bg-danger-soft',
  }
  const periodOf = (row: RelationRow) => qualifierText({ ...row.period, part: null })
</script>

<template>
  <Panel :title="title" :count="live">
    <template #actions>
      <Button
        :as="NuxtLink"
        :to="{ path: base, query: { ...route.query, panel } }"
        size="sm"
        variant="ghost"
      >
        <template #icon><Plus /></template>
        添加{{ title }}
      </Button>
    </template>
    <Empty v-if="!rows.length" :title="`暂无${title}`" />
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>{{ noun }}</TableHead>
          <TableHead>期间</TableHead>
          <TableHead class="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.key" :class="TONE[row.state]">
          <TableCell class="w-full max-w-0 py-2.5">
            <Link
              :as="NuxtLink"
              :to="`/entries/${row.other.id}/edit`"
              lang="ja"
              :class="cn('truncate text-sm', row.state === 'removed' && 'line-through')"
            >
              {{ row.other.label || '未命名' }}
            </Link>
          </TableCell>
          <TableCell class="py-2.5 whitespace-nowrap">
            <Text size="sm" :tone="periodOf(row) ? undefined : 'muted'" class="tabular-nums">
              {{ periodOf(row) ?? '未记录' }}
            </Text>
          </TableCell>
          <TableCell class="py-2.5">
            <Inline justify="end" :wrap="false">
              <IconButton
                v-if="row.state === 'removed'"
                label="撤回"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="links.undo(row)"
              >
                <Undo2 />
              </IconButton>
              <DropdownMenu v-else align="end">
                <IconButton label="更多操作" variant="ghost" tone="neutral" size="sm">
                  <Ellipsis />
                </IconButton>
                <template #content>
                  <DropdownMenuItem @select="editing = row">修改期间</DropdownMenuItem>
                  <DropdownMenuItem v-if="row.state === 'changed'" @select="links.undo(row)">
                    撤回修改
                  </DropdownMenuItem>
                  <DropdownMenuItem @select="links.remove(row)">
                    {{ row.state === 'added' ? '取消添加' : '删除' }}
                  </DropdownMenuItem>
                </template>
              </DropdownMenu>
            </Inline>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <WikiOrganizationPeriod
      v-model:open="open"
      :row="editing"
      @done="period => editing && links.period(editing, period)"
    />
  </Panel>
</template>

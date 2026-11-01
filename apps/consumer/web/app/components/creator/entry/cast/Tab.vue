<script setup lang="ts">
  import {
    Empty,
    Inline,
    Link,
    Panel,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendEntryReferenceGroup } from '~/features/creator/entry/contract'

  defineOptions({ name: 'CreatorEntryCastTab' })
  const props = defineProps<{ groups: BackendEntryReferenceGroup[] }>()

  const items = computed(() => props.groups.flatMap(group => group.items))
  const total = computed(() => props.groups.reduce((sum, group) => sum + group.total, 0))
</script>

<template>
  <Panel title="出场角色" :padded="false">
    <template #title>
      出场角色
      <Text v-if="total" as="span" size="sm" tone="muted" weight="normal" class="ms-1 tabular-nums">
        {{ total }}
      </Text>
      <CreatorEntryHint name="cast" class="ms-1 align-middle" />
    </template>
    <Empty v-if="!items.length" title="尚无出场角色" />
    <Table v-else variant="secondary" hover class="hikari-panel-table">
      <TableHeader>
        <TableRow>
          <TableHead>标签名</TableHead>
          <TableHead>配音</TableHead>
          <TableHead><span class="sr-only">打开</span></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in items" :key="item.statement_id" class="relative">
          <TableCell>
            <Inline gap="sm" align="center">
              <Link
                :as="NuxtLink"
                :to="`/create/edit/entry/${item.entry.id}`"
                tone="neutral"
                :underline="false"
                lang="ja"
                class="after:absolute after:inset-0"
              >
                {{ item.entry.label }}
              </Link>
              <Tag v-if="!item.sourced" tone="warning">无来源</Tag>
            </Inline>
          </TableCell>
          <TableCell lang="ja">{{ item.credits.join('、') || '—' }}</TableCell>
          <TableCell class="w-0 text-muted">
            <ChevronRight class="size-4" aria-hidden="true" />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
    <Text v-if="total > items.length" as="p" size="xs" tone="muted" class="px-(--hn-panel-p) py-3">
      共 {{ total }} 项；此处列出前 {{ items.length }} 项
    </Text>
  </Panel>
</template>

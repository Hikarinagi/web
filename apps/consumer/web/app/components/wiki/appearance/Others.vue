<script setup lang="ts">
  import {
    Button,
    Empty,
    IconButton,
    Inline,
    Link,
    Panel,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { Eye, EyeOff, Plus, Undo2, X } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { useEntryCards } from '~/features/wiki/composables/useEntryCards'
  import type { EditableEntry, EntryStatement, ValueDraft } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiAppearanceOthers' })

  const props = defineProps<{ appearance: number; base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const relation = computed(() =>
    editor.definitions.value
      .get('APPEARANCE')
      ?.properties.find(item => item.property === 'APPEARANCE_RELATION'),
  )
  const live = (entry: EditableEntry, property: EntryStatement['property']) =>
    entry.statements.filter(item => item.property === property && item.status !== 'DEPRECATED')
  const relations = computed(() => editor.property(props.appearance, 'APPEARANCE_RELATION').values)
  const siblings = computed(() =>
    [...editor.entries.value.values()].filter(
      entry => entry.type === 'APPEARANCE' && entry.id !== props.appearance,
    ),
  )
  const cards = useEntryCards(
    () => [
      ...siblings.value.map(entry => entry.id),
      ...relations.value.flatMap(item => (item.value.target ? [item.value.target.id] : [])),
    ],
    ['APPEARANCE'],
  )
  type Row = {
    key: string
    work: NonNullable<ValueDraft['target']> | null
    card: number
    name: string
    voices: string[]
    state: 'same' | 'added' | 'removed'
    concealed: boolean
    conceal: (() => void) | null
    act: () => void
  }
  const rows = computed<Row[]>(() =>
    [
      ...siblings.value.map(entry => {
        const detached = editor.draft.value.detached.includes(entry.id)
        return {
          key: `entry-${entry.id}`,
          work: live(entry, 'WORK')[0]?.target ?? null,
          card: entry.id,
          name: live(entry, 'LABEL')[0]?.text || entry.label,
          voices: live(entry, 'CREDIT').flatMap(item => item.text ?? item.target?.label ?? []),
          state: detached ? ('removed' as const) : ('same' as const),
          concealed: false,
          conceal: null,
          act: () => editor.detach(entry.id, !detached),
        }
      }),
      ...relations.value.flatMap((item): Row[] => {
        const target = item.value.target
        if (!target) return []
        const card = cards.value.get(target.id)
        const state = item.state === 'added' || item.state === 'removed' ? item.state : 'same'
        return [
          {
            key: `value-${item.id}`,
            work: card?.owner ?? null,
            card: target.id,
            name: card?.label ?? target.label,
            voices: card?.voices ?? [],
            state,
            concealed: !item.value.is_public,
            conceal:
              state === 'removed'
                ? null
                : () => editor.set(item.id, { ...item.value, is_public: !item.value.is_public }),
            act: () => (state === 'same' ? editor.remove(item.id) : editor.revert(item.id)),
          },
        ]
      }),
    ].sort(
      (a, b) => (cards.value.get(a.card)?.year ?? 9999) - (cards.value.get(b.card)?.year ?? 9999),
    ),
  )
  const count = computed(() => rows.value.filter(row => row.state !== 'removed').length)
  const TONE: Record<Row['state'], string> = {
    same: '',
    added: 'bg-success-soft',
    removed: 'bg-danger-soft',
  }
  const LABEL: Record<Row['state'], string> = { same: '移出', added: '取消添加', removed: '撤回' }
</script>

<template>
  <Panel title="其他作品中的出场" :count="count">
    <template #actions>
      <WikiFieldRule
        v-if="relation?.clauses.length"
        label="其他作品中的出场"
        :clauses="relation.clauses"
      />
      <Button
        :as="NuxtLink"
        :to="{ path: base, query: { ...route.query, panel: 'same' } }"
        size="sm"
        variant="ghost"
      >
        <template #icon><Plus /></template>
        添加出场
      </Button>
    </template>
    <Empty v-if="!rows.length" title="暂无其他作品中的出场" />
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>作品</TableHead>
          <TableHead class="max-sm:hidden">名字</TableHead>
          <TableHead class="max-sm:hidden">配音</TableHead>
          <TableHead class="w-12" />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="row in rows" :key="row.key" :class="TONE[row.state]">
          <TableCell class="w-full max-w-0 py-2.5">
            <Inline gap="sm" align="center" :wrap="false">
              <Stack gap="xs" class="min-w-0 flex-1">
                <WikiWorkLine
                  v-if="row.work"
                  :work="row.work"
                  :card="cards.get(row.card)"
                  link
                  :strike="row.state === 'removed'"
                />
                <Inline gap="md" :wrap="false" class="min-w-0 sm:hidden">
                  <Link :as="NuxtLink" :to="`/entries/${row.card}/edit`" lang="ja" class="text-sm">
                    {{ row.name }}
                  </Link>
                  <Text
                    size="sm"
                    lang="ja"
                    truncate
                    :tone="row.voices.length ? undefined : 'muted'"
                  >
                    {{ row.voices.join('、') || '配音未记录' }}
                  </Text>
                </Inline>
              </Stack>
              <Tag v-if="row.concealed" tone="warning" size="sm" class="shrink-0">未公开</Tag>
            </Inline>
          </TableCell>
          <TableCell class="py-2.5 whitespace-nowrap max-sm:hidden">
            <Link :as="NuxtLink" :to="`/entries/${row.card}/edit`" lang="ja" class="text-sm">
              {{ row.name }}
            </Link>
          </TableCell>
          <TableCell class="py-2.5 whitespace-nowrap max-sm:hidden">
            <Text size="sm" lang="ja" :tone="row.voices.length ? undefined : 'muted'">
              {{ row.voices.join('、') || '未记录' }}
            </Text>
          </TableCell>
          <TableCell class="py-2.5">
            <Inline justify="end" align="center" gap="xs" :wrap="false">
              <IconButton
                v-if="row.conceal"
                :label="row.concealed ? '取消未公开' : '记为未公开'"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="row.conceal()"
              >
                <Eye v-if="row.concealed" />
                <EyeOff v-else />
              </IconButton>
              <IconButton
                :label="LABEL[row.state]"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="row.act()"
              >
                <Undo2 v-if="row.state === 'removed'" />
                <X v-else />
              </IconButton>
            </Inline>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  </Panel>
</template>

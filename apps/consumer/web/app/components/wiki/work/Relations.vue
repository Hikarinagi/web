<script setup lang="ts">
  import {
    Button,
    Empty,
    FormLayout,
    IconButton,
    Inline,
    Link,
    Panel,
    Select,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { Plus, Undo2, X } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'
  import { codeLabel, relationPhrase } from '~/features/wiki/values'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiWorkRelations' })

  const props = defineProps<{ work: EditableEntry; base: string }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const definition = computed(() => editor.definitions.value.get(props.work.type))
  const field = (property: string) =>
    definition.value?.properties.find(item => item.property === property)
  const relation = computed(() => field('GAME_RELATION'))
  const rows = computed(() =>
    props.work.type === 'GAME' ? editor.property(props.work.id, 'GAME_RELATION').values : [],
  )
  const options = computed(() =>
    (relation.value?.codes ?? []).map(value => ({
      value,
      label: codeLabel('GAME_RELATION', value),
    })),
  )
  const { data } = useHikariApiData('/api/v3/wiki/entries/{id}/references', {
    key: `wiki-entry-references-${props.work.id}`,
    path: { id: props.work.id },
    lazy: true,
    server: false,
    toast: false,
  })
  const incoming = computed(() =>
    (data.value ?? [])
      .filter(group => group.property === 'GAME_RELATION' && props.work.type === 'GAME')
      .flatMap(group => group.items),
  )
  const live = computed(() => rows.value.filter(item => item.state !== 'removed').length)
  const TONE: Record<string, string> = {
    added: 'bg-success-soft',
    changed: 'bg-accent-soft',
    removed: 'bg-danger-soft',
  }
</script>

<template>
  <Panel v-if="work.type === 'GAME' && relation" title="相关作品" :count="live + incoming.length">
    <template #actions>
      <WikiFieldRule v-if="relation.clauses.length" label="相关作品" :clauses="relation.clauses" />
      <Button
        :as="NuxtLink"
        :to="{ path: `${base}/relation`, query: route.query }"
        size="sm"
        variant="ghost"
      >
        <template #icon><Plus /></template>
        添加相关作品
      </Button>
    </template>
    <Empty v-if="!rows.length && !incoming.length" title="暂无相关作品" />
    <Table v-else>
      <TableHeader>
        <TableRow>
          <TableHead>作品</TableHead>
          <TableHead>关系</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow v-for="item in rows" :key="item.id" :class="TONE[item.state]">
          <TableCell class="py-3">
            <Link
              v-if="item.value.target"
              :as="NuxtLink"
              :to="`/entries/${item.value.target.id}/edit`"
              lang="ja"
              :class="cn('text-sm', item.state === 'removed' && 'line-through')"
            >
              {{ item.value.target.label || '未命名' }}
            </Link>
          </TableCell>
          <TableCell class="py-3">
            <Inline gap="sm" align="center" :wrap="false">
              <Text size="sm" tone="muted" class="shrink-0">它是本作的</Text>
              <Text v-if="item.state === 'removed'" size="sm" class="line-through">
                {{ options.find(option => option.value === item.value.code)?.label }}
              </Text>
              <Select
                v-else
                :model-value="item.value.code"
                :options="options"
                size="sm"
                aria-label="关系"
                class="w-28"
                @update:model-value="
                  value =>
                    editor.set(item.id, { ...item.value, code: value ? String(value) : null })
                "
              />
            </Inline>
          </TableCell>
          <TableCell class="py-3">
            <Inline justify="end" :wrap="false">
              <IconButton
                v-if="item.state === 'removed' || item.state === 'changed'"
                label="撤回"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="editor.revert(item.id)"
              >
                <Undo2 />
              </IconButton>
              <IconButton
                v-if="item.state !== 'removed'"
                :label="item.state === 'added' ? '取消添加' : '删除'"
                variant="ghost"
                tone="neutral"
                size="sm"
                @click="item.state === 'added' ? editor.revert(item.id) : editor.remove(item.id)"
              >
                <X />
              </IconButton>
            </Inline>
          </TableCell>
        </TableRow>
        <TableRow v-for="item in incoming" :key="`in-${item.statement_id}`">
          <TableCell class="py-3">
            <Link
              :as="NuxtLink"
              :to="`/entries/${item.entry.id}/edit/relations`"
              lang="ja"
              class="text-sm"
            >
              {{ item.entry.label }}
            </Link>
          </TableCell>
          <TableCell class="py-3">
            <Text size="sm" tone="muted">
              {{ item.code ? relationPhrase('GAME_RELATION', item.code, 'self') : '' }}
            </Text>
          </TableCell>
          <TableCell />
        </TableRow>
      </TableBody>
    </Table>
  </Panel>
  <Panel v-else-if="field('SERIES_RELATION')" title="相关作品">
    <FormLayout orientation="responsive" label-width="8rem">
      <WikiFieldProperty
        :entry="work.id"
        :definition="field('SERIES_RELATION')!"
        label="相关系列"
      />
    </FormLayout>
  </Panel>
  <Panel v-if="field('ADAPTATION')" title="改编">
    <Stack gap="md">
      <FormLayout orientation="responsive" label-width="8rem">
        <WikiFieldProperty :entry="work.id" :definition="field('ADAPTATION')!" label="改编作品" />
      </FormLayout>
    </Stack>
  </Panel>
</template>

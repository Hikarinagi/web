<script setup lang="ts">
  import {
    Affix,
    Button,
    Card,
    Heading,
    Inline,
    SearchInput,
    Stack,
    Table,
    TableBody,
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import type { EditableEntry } from '~/features/wiki/editor/draft'

  defineOptions({ name: 'WikiWorkCast' })

  const props = defineProps<{ work: EditableEntry }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const nav = usePageNav()
  const parts = useEditorParts(editor, () => ({
    id: props.work.id,
    type: props.work.type,
    label: props.work.label,
  }))
  const filter = computed({
    get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
    set: value => {
      void nav.query({ q: value || null }, 'replace')
    },
  })
  const field = (property: 'LABEL' | 'CREDIT') =>
    editor.definitions.value.get('APPEARANCE')?.properties.find(item => item.property === property)
  const texts = (id: number, property: 'LABEL' | 'CREDIT') =>
    editor
      .property(id, property)
      .values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
      .map(item => item.value.text ?? item.value.target?.label ?? '')
      .filter(Boolean)
  const rows = computed(() =>
    parts.entriesOf('APPEARANCE').map(item => ({ id: item.id, names: texts(item.id, 'LABEL') })),
  )
  const shown = computed(() => {
    const keyword = filter.value.trim()
    return keyword
      ? rows.value.filter(row =>
          [...row.names, ...texts(row.id, 'CREDIT')].some(text => text.includes(keyword)),
        )
      : rows.value
  })
  const twinsOf = (row: (typeof rows.value)[number]) =>
    rows.value
      .filter(other => other.id !== row.id && other.names.some(name => row.names.includes(name)))
      .map(other => other.id)
</script>

<template>
  <Stack gap="md">
    <Affix :offset="56" class="z-10">
      <Inline gap="md" align="center" class="bg-canvas py-2">
        <Heading :level="2" size="xs" class="shrink-0">出场角色 {{ rows.length }}</Heading>
        <SearchInput
          v-model="filter"
          aria-label="筛选出场角色"
          placeholder="按名字或配音筛选"
          class="min-w-0 flex-1 max-md:order-last max-md:basis-full"
        />
        <Button
          size="sm"
          variant="outline"
          tone="neutral"
          class="shrink-0 max-md:ml-auto"
          @click="parts.cast()"
        >
          <template #icon><Plus /></template>
          添加出场角色
        </Button>
      </Inline>
    </Affix>
    <Text v-if="filter && !shown.length" size="sm" tone="muted">无符合条件的出场角色</Text>
    <template v-else>
      <Card :padded="false" class="overflow-hidden max-md:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                名字
                <WikiFieldRule
                  v-if="field('LABEL')?.clauses.length"
                  label="名字"
                  :clauses="field('LABEL')!.clauses"
                />
              </TableHead>
              <TableHead>
                配音
                <WikiFieldRule
                  v-if="field('CREDIT')?.clauses.length"
                  label="配音"
                  :clauses="field('CREDIT')!.clauses"
                />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            <WikiWorkCastRow
              v-for="row in shown"
              :key="row.id"
              :appearance="row.id"
              :twins="twinsOf(row)"
            />
          </TableBody>
        </Table>
      </Card>
      <Stack gap="sm" class="md:hidden">
        <WikiWorkCastCard v-for="row in shown" :key="row.id" :appearance="row.id" />
      </Stack>
    </template>
  </Stack>
</template>

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
    TableHead,
    TableHeader,
    TableRow,
    Text,
  } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { castFacts, castGroups, placeCast, type CastGroup } from '~/features/wiki/editor/cast'
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
  const COLUMNS = [
    { property: 'LABEL', label: '名字' },
    { property: 'CREDIT', label: '配音' },
    { property: 'CAST_ROLE', label: '定位' },
  ] as const
  const game = computed(() => props.work.type === 'GAME')
  const filter = computed({
    get: () => (typeof route.query.q === 'string' ? route.query.q : ''),
    set: value => {
      void nav.query({ q: value || null }, 'replace')
    },
  })
  const field = (property: 'LABEL' | 'CREDIT' | 'CAST_ROLE' | 'CAPTURABLE') =>
    editor.definitions.value.get('APPEARANCE')?.properties.find(item => item.property === property)
  const clausesOf = (property: (typeof COLUMNS)[number]['property']) => [
    ...new Set([
      ...(field(property)?.clauses ?? []),
      ...(property === 'CAST_ROLE' && game.value ? (field('CAPTURABLE')?.clauses ?? []) : []),
    ]),
  ]
  const texts = (id: number, property: 'LABEL' | 'CREDIT') =>
    editor
      .property(id, property)
      .values.filter(item => item.state !== 'removed' && item.state !== 'moved_out')
      .map(item => item.value.text ?? item.value.target?.label ?? '')
      .filter(Boolean)
  const rows = computed(() =>
    parts.entriesOf('APPEARANCE').map(item => ({ id: item.id, names: texts(item.id, 'LABEL') })),
  )
  const groups = computed(() =>
    castGroups(
      rows.value.map(row => castFacts(editor, row.id)),
      game.value,
    ),
  )
  const keyword = computed(() => filter.value.trim())
  const matches = (id: number) =>
    !keyword.value ||
    [...texts(id, 'LABEL'), ...texts(id, 'CREDIT')].some(text => text.includes(keyword.value))
  const shown = computed(() =>
    groups.value
      .map(group => ({ ...group, ids: group.ids.filter(matches) }))
      .filter(group => group.ids.length),
  )
  const twinsOf = (id: number) => {
    const names = rows.value.find(row => row.id === id)?.names ?? []
    return rows.value
      .filter(other => other.id !== id && other.names.some(name => names.includes(name)))
      .map(other => other.id)
  }

  function reorder(key: CastGroup, ids: number[]) {
    placeCast(
      editor,
      groups.value.flatMap(group => (group.key === key ? ids : group.ids)),
    )
  }

  function step(key: CastGroup, id: number, delta: -1 | 1) {
    const ids = [...(groups.value.find(group => group.key === key)?.ids ?? [])]
    const from = ids.indexOf(id)
    if (from < 0 || from + delta < 0 || from + delta >= ids.length) return
    ids.splice(from + delta, 0, ids.splice(from, 1)[0]!)
    reorder(key, ids)
  }

  const flashing = ref(new Set<number>())
  const placed = computed(
    () => new Map(groups.value.flatMap(group => group.ids.map(id => [id, group.key] as const))),
  )
  watch(placed, (next, prev) => {
    for (const [id, key] of next) {
      if (!prev.has(id) || prev.get(id) === key) continue
      flashing.value = new Set([...flashing.value, id])
      void nextTick(() =>
        document
          .querySelector(`[data-cast="${id}"]`)
          ?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }),
      )
      setTimeout(() => {
        const rest = new Set(flashing.value)
        rest.delete(id)
        flashing.value = rest
      }, 1200)
    }
  })
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
      <Card :padded="false" class="overflow-x-auto max-md:hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead class="w-16" />
              <TableHead v-for="column in COLUMNS" :key="column.property">
                {{ column.label }}
                <WikiFieldRule
                  v-if="clausesOf(column.property).length"
                  :label="column.label"
                  :clauses="clausesOf(column.property)"
                />
              </TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <WikiWorkCastGroup
            v-for="group in shown"
            :key="group.key"
            :title="group.title"
            :ids="group.ids"
            :sortable="!keyword"
            :game="game"
            :columns="5"
            :flashing="flashing"
            :twins-of="twinsOf"
            @reorder="ids => reorder(group.key, ids)"
          />
        </Table>
      </Card>
      <Stack gap="lg" class="md:hidden">
        <Stack v-for="group in shown" :key="group.key" gap="sm">
          <Text size="xs" weight="medium" tone="muted"
            >{{ group.title }} {{ group.ids.length }}</Text
          >
          <WikiWorkCastCard
            v-for="(id, index) in group.ids"
            :key="id"
            :appearance="id"
            :game="game"
            :first="index === 0 || Boolean(keyword)"
            :last="index === group.ids.length - 1 || Boolean(keyword)"
            :flash="flashing.has(id)"
            @step="delta => step(group.key, id, delta)"
          />
        </Stack>
      </Stack>
    </template>
  </Stack>
</template>

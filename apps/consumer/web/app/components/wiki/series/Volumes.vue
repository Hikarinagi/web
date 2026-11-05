<script setup lang="ts">
  import { AspectRatio, Button, Card, Empty, Inline, SimpleGrid, Stack, Text } from '@hina-ui/vue'
  import { Plus } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import { useEditorParts } from '~/features/wiki/composables/useEditorParts'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'
  import { entryState, type EditableEntry } from '~/features/wiki/editor/draft'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'WikiSeriesVolumes' })

  const props = defineProps<{ series: EditableEntry; volume: number | null; book: number | null }>()
  const editor = inject(ENTRY_EDITOR)!
  const route = useRoute()
  const nav = usePageNav()
  const parts = useEditorParts(editor, () => ({
    id: props.series.id,
    type: props.series.type,
    label: props.series.label,
  }))
  const base = computed(() => `/entries/${props.series.id}/edit/volumes`)
  const volumes = computed(() => parts.entriesOf('VOLUME'))
  const current = computed(
    () => volumes.value.find(item => item.id === props.volume) ?? volumes.value[0] ?? null,
  )
  const booksOf = (volume: number) =>
    parts
      .entriesOf('BOOK')
      .filter(book => parts.first(book.id, 'INCLUDED_VOLUME')?.target?.id === volume)
  const coverOf = (volume: number) =>
    booksOf(volume)
      .map(book => parts.first(book.id, 'COVER')?.media ?? null)
      .find(Boolean) ?? null
  const owner = (statement: number) => editor.statements.value.get(statement)?.entry
  const touched = (volume: number) =>
    [volume, ...booksOf(volume).map(book => book.id)].some(id =>
      entryState(editor.draft.value, owner, id),
    )

  function addVolume() {
    const id = parts.create('VOLUME', [
      ['SERIES', { target: { id: props.series.id, type: 'SERIES', label: props.series.label } }],
      ['TITLE', {}],
    ])
    void nav.push({ path: `${base.value}/${id}`, query: route.query })
  }
</script>

<template>
  <Stack gap="lg">
    <Stack gap="sm">
      <Inline gap="sm" align="center" justify="between">
        <Text size="sm" tone="muted">共 {{ volumes.length }} 卷</Text>
        <Button size="sm" variant="outline" tone="neutral" @click="addVolume">
          <template #icon><Plus /></template>
          新建卷
        </Button>
      </Inline>
      <SimpleGrid v-if="volumes.length" min="6.5rem" gap="sm">
        <Card
          v-for="item in volumes"
          :key="item.id"
          :as="NuxtLink"
          :to="{ path: `${base}/${item.id}`, query: route.query }"
          :padded="false"
          :aria-current="item.id === current?.id ? 'true' : undefined"
          :class="
            cn(
              'hn-state-layer hn-interactive overflow-hidden',
              item.id === current?.id && 'ring-2 ring-accent',
            )
          "
        >
          <AspectRatio :ratio="3 / 4" class="bg-inset">
            <HikariImage
              v-if="coverOf(item.id)"
              :src="coverOf(item.id)"
              alt=""
              preset="small"
              class="size-full"
              image-class="size-full object-cover"
            />
          </AspectRatio>
          <Stack gap="none" class="px-2 py-1.5">
            <Inline gap="xs" align="baseline" :wrap="false" class="min-w-0">
              <Text size="xs" weight="medium" class="shrink-0">
                {{ parts.first(item.id, 'VOLUME_NUMBER')?.text || '暂无卷次' }}
              </Text>
              <Text v-if="touched(item.id)" size="xs" class="shrink-0 text-accent-text">
                有修改
              </Text>
            </Inline>
            <Text size="xs" tone="muted" lang="ja" truncate>
              {{ parts.first(item.id, 'TITLE')?.text || '新的卷' }}
            </Text>
          </Stack>
        </Card>
      </SimpleGrid>
    </Stack>
    <WikiSeriesVolume
      v-if="current"
      :key="current.id"
      :series="series"
      :volume="current"
      :book="book"
    />
    <Empty v-else title="暂无卷" />
  </Stack>
</template>

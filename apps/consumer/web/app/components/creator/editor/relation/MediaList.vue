<script setup lang="ts">
  import { Inline, Tag } from '@hina-ui/vue'
  import type { BackendEditorField } from '~/features/creator/editor'
  import type { MediaValue } from '~/components/media-library/types'
  import { toRelationRows, type EditorRelationRow } from '~/features/creator/editor/relation'
  import MediaAttrPopover from '~/components/creator/editor/relation/MediaAttrPopover.vue'

  const props = defineProps<{
    field: BackendEditorField
  }>()
  const model = defineModel<EditorRelationRow[]>({ default: () => [] })
  const rows = computed(() => toRelationRows(model.value))

  const attrNames = computed(() => new Set((props.field.attributes ?? []).map(a => a.name)))
  const attrHelp = computed(
    () => new Map((props.field.attributes ?? []).map(a => [a.name, a.help])),
  )
  const orderable = computed(() => attrNames.value.has('order'))
  const hasSexual = computed(() => attrNames.value.has('sexual'))
  const hasViolence = computed(() => attrNames.value.has('violence'))

  function renumber(list: EditorRelationRow[]): EditorRelationRow[] {
    if (!orderable.value) return list
    return list.map((row, index) => ({
      ...row,
      attributes: { ...row.attributes, order: index },
    }))
  }

  function toRow(media: MediaValue): EditorRelationRow {
    return {
      target_id: media.id,
      target: { name: '', cover: media.src, width: media.width, height: media.height },
      attributes: {},
    }
  }

  const medias = computed<MediaValue[]>({
    get: () =>
      rows.value.map(row => ({
        id: row.target_id,
        src: row.target.cover ?? '',
        width: row.target.width,
        height: row.target.height,
      })),
    set: next => {
      const byId = new Map(rows.value.map(r => [r.target_id, r]))
      const reconciled = next.map(media => byId.get(media.id) ?? toRow(media))
      model.value = renumber(reconciled)
    },
  })

  function addMany(picks: MediaValue[]) {
    const existing = new Set(rows.value.map(row => row.target_id))
    const fresh = picks.filter(media => !existing.has(media.id))
    if (!fresh.length) return
    model.value = renumber([...rows.value, ...fresh.map(toRow)])
  }

  function rowOf(id: number): EditorRelationRow | undefined {
    return rows.value.find(row => row.target_id === id)
  }

  function cycleLevel(targetId: number, key: 'sexual' | 'violence') {
    model.value = rows.value.map(row => {
      if (row.target_id !== targetId) return row
      const current = typeof row.attributes[key] === 'number' ? (row.attributes[key] as number) : 0
      return { ...row, attributes: { ...row.attributes, [key]: (current + 1) % 3 } }
    })
  }

  function readLevel(row: EditorRelationRow, key: 'sexual' | 'violence'): number {
    const value = row.attributes[key]
    return typeof value === 'number' && value >= 0 && value <= 2 ? value : 0
  }

  const RATING_ATTRS = new Set(['order', 'sexual', 'violence'])

  const metaAttrs = computed(() =>
    (props.field.attributes ?? []).filter(attr => !RATING_ATTRS.has(attr.name)),
  )

  function replaceRow(next: EditorRelationRow) {
    model.value = rows.value.map(row => (row.target_id === next.target_id ? next : row))
  }

  const LEVEL_TONE = ['neutral', 'warning', 'danger'] as const

  function levelTone(row: EditorRelationRow, key: 'sexual' | 'violence') {
    return LEVEL_TONE[readLevel(row, key)]
  }
</script>

<template>
  <MediaLibrarySelection v-model="medias" :sortable="orderable">
    <template v-if="hasSexual || hasViolence" #overlay="{ media }">
      <Inline
        v-if="rowOf(media.id)"
        gap="xs"
        align="center"
        :wrap="false"
        class="absolute inset-x-1.5 bottom-1.5 min-w-0 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
      >
        <Tag
          v-if="hasSexual"
          v-tooltip="attrHelp.get('sexual') ?? null"
          as="button"
          type="button"
          size="sm"
          variant="solid"
          :tone="levelTone(rowOf(media.id)!, 'sexual')"
          class="hn-state-layer hn-interactive"
          @click="cycleLevel(media.id, 'sexual')"
        >
          Se {{ readLevel(rowOf(media.id)!, 'sexual') }}
        </Tag>
        <Tag
          v-if="hasViolence"
          v-tooltip="attrHelp.get('violence') ?? null"
          as="button"
          type="button"
          size="sm"
          variant="solid"
          :tone="levelTone(rowOf(media.id)!, 'violence')"
          class="hn-state-layer hn-interactive"
          @click="cycleLevel(media.id, 'violence')"
        >
          Vi {{ readLevel(rowOf(media.id)!, 'violence') }}
        </Tag>
        <MediaAttrPopover
          v-if="metaAttrs.length"
          :attributes="metaAttrs"
          :row="rowOf(media.id)!"
          @update:row="replaceRow"
        />
      </Inline>
    </template>
    <template #add>
      <MediaLibraryAdd mode="multiple" @pick="addMany" />
    </template>
  </MediaLibrarySelection>
</template>

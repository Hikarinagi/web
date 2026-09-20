<script setup lang="ts">
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

  const medias = computed<MediaValue[]>({
    get: () =>
      rows.value.map(row => ({
        id: row.target_id,
        src: row.target.cover ?? '',
        width: null,
        height: null,
      })),
    set: next => {
      const byId = new Map(rows.value.map(r => [r.target_id, r]))
      const reconciled = next.map(
        media =>
          byId.get(media.id) ?? {
            target_id: media.id,
            target: { name: '', cover: media.src },
            attributes: {},
          },
      )
      model.value = renumber(reconciled)
    },
  })

  function addMany(picks: MediaValue[]) {
    const existing = new Set(rows.value.map(row => row.target_id))
    const fresh = picks.filter(media => !existing.has(media.id))
    if (!fresh.length) return
    model.value = renumber([
      ...rows.value,
      ...fresh.map(media => ({
        target_id: media.id,
        target: { name: '', cover: media.src },
        attributes: {},
      })),
    ])
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

  const SEXUAL_TONE = [
    'bg-surface-900/55 text-white',
    'bg-amber-500/85 text-white',
    'bg-rose-500/90 text-white',
  ] as const
  const VIOLENCE_TONE = [
    'bg-surface-900/55 text-white',
    'bg-orange-500/85 text-white',
    'bg-red-600/90 text-white',
  ] as const
</script>

<template>
  <MediaLibrarySelection v-model="medias" :sortable="orderable">
    <template v-if="hasSexual || hasViolence" #overlay="{ media }">
      <div
        v-if="rowOf(media.id)"
        class="absolute inset-x-1.5 bottom-1.5 flex min-w-0 items-center gap-1.5 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:focus-within:opacity-100"
      >
        <Button
          v-if="hasSexual"
          v-tooltip.top="attrHelp.get('sexual') ?? null"
          unstyled
          :class="[
            'flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[10px] font-medium whitespace-nowrap transition-colors',
            SEXUAL_TONE[readLevel(rowOf(media.id)!, 'sexual')],
          ]"
          @click="cycleLevel(media.id, 'sexual')"
        >
          Se {{ readLevel(rowOf(media.id)!, 'sexual') }}
        </Button>
        <Button
          v-if="hasViolence"
          v-tooltip.top="attrHelp.get('violence') ?? null"
          unstyled
          :class="[
            'flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[10px] font-medium whitespace-nowrap transition-colors',
            VIOLENCE_TONE[readLevel(rowOf(media.id)!, 'violence')],
          ]"
          @click="cycleLevel(media.id, 'violence')"
        >
          Vi {{ readLevel(rowOf(media.id)!, 'violence') }}
        </Button>
        <MediaAttrPopover
          v-if="metaAttrs.length"
          :attributes="metaAttrs"
          :row="rowOf(media.id)!"
          @update:row="replaceRow"
        />
      </div>
    </template>
    <template #add>
      <MediaLibraryAdd mode="multiple" @pick="addMany" />
    </template>
  </MediaLibrarySelection>
</template>

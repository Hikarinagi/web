<script setup lang="ts">
  import { Checkbox, CheckboxGroup, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import {
    EDITOR_VALUES_KEY,
    REF_APPLY_KEY,
  } from '~/features/creator/composables/useChangeRequestEditor'
  import { importProvisionalEntity } from '~/features/creator/editor/create-entity'
  import type { EditorRelationRow } from '~/features/creator/editor/relation'
  import type {
    ScreenshotCandidate,
    TagCandidate,
  } from '~/features/creator/composables/useSyncDraft'
  import type {
    LnRoster,
    RelationCandidate,
    ScalarCandidate,
    SyncField,
  } from '~/features/creator/editor/sync'

  const props = defineProps<{
    scalars: ScalarCandidate[]
    rels: RelationCandidate[]
    cover: string | null
    coverField: string | null
    author: LnRoster['author']
    screenshots: ScreenshotCandidate[]
    tags: TagCandidate[]
    presentation: Record<string, { label?: string }>
    fields: SyncField[]
    comparedSources: string
    relationField: string | null
  }>()
  const emit = defineEmits<{
    add: [field: string, row: EditorRelationRow]
    applied: []
  }>()

  const pickedScalars = ref(props.scalars.filter(c => !c.conflict).map(c => c.field))
  const pickedRels = ref(props.rels.map(r => r.target_id))
  const coverPicked = ref(!!props.cover)
  const authorPicked = ref(!!props.author)
  const screenshotsPicked = ref(props.screenshots.length > 0)
  const pickedTags = ref(props.tags.map(tag => tag.matched_id))
  const applying = ref(false)
  const refApply = inject(REF_APPLY_KEY, null)
  const values = inject(EDITOR_VALUES_KEY, {})

  const dateFields = computed(
    () => new Set(props.fields.filter(f => f.value_type === 'date').map(f => f.field)),
  )
  const labelOf = (field: string) => props.presentation[field]?.label ?? field
  const relationLabel = computed(
    () => (props.relationField && props.presentation[props.relationField]?.label) || '关联作品',
  )
  const sourceLabel = (s?: string) => (s === 'vndb' ? 'VNDB' : s === 'bangumi' ? 'Bangumi' : '')

  const tagOptions = computed(() =>
    props.tags.map(tag => ({ value: tag.matched_id, label: tag.name })),
  )

  function toggleScalar(field: string, on: boolean | 'indeterminate') {
    pickedScalars.value =
      on === true
        ? [...pickedScalars.value, field]
        : pickedScalars.value.filter(picked => picked !== field)
  }

  function toggleRel(targetId: number, on: boolean | 'indeterminate') {
    pickedRels.value =
      on === true
        ? [...pickedRels.value, targetId]
        : pickedRels.value.filter(picked => picked !== targetId)
  }

  function scalarOp(c: ScalarCandidate) {
    return { kind: 'scalar', field: c.field, from: c.from, to: c.to, value_type: c.value_type }
  }
  function relationOp(r: RelationCandidate) {
    return {
      kind: 'relation_add',
      relation: props.relationField ?? undefined,
      target_id: r.target_id,
      target_name: r.name,
      target_cover: r.cover ?? undefined,
      attributes: { relation: r.relation },
    }
  }

  async function apply() {
    if (applying.value) return
    applying.value = true
    try {
      for (const c of props.scalars) {
        if (!pickedScalars.value.includes(c.field)) continue
        const value =
          dateFields.value.has(c.field) && typeof c.to === 'string' ? new Date(c.to) : c.to
        values[c.field] = value
      }
      if (props.relationField) {
        for (const r of props.rels) {
          if (!pickedRels.value.includes(r.target_id)) continue
          emit('add', props.relationField, {
            target_id: r.target_id,
            target: { name: r.name, cover: r.cover },
            attributes: { relation: r.relation },
          })
        }
      }
      if (props.cover && props.coverField && coverPicked.value) {
        const media = await hikariRequest('/api/v3/external-source/cover-media', {
          method: 'POST',
          body: { url: props.cover },
        })
        values[props.coverField] = { id: media.id, src: media.src }
      }
      for (const tag of props.tags) {
        if (!pickedTags.value.includes(tag.matched_id)) continue
        emit('add', 'tags', {
          target_id: tag.matched_id,
          target: { name: tag.name, cover: null },
          attributes: {},
        })
      }
      if (props.screenshots.length && screenshotsPicked.value) {
        const rows = await Promise.all(
          props.screenshots.map(async shot => {
            try {
              const media = await hikariRequest('/api/v3/external-source/cover-media', {
                method: 'POST',
                body: { url: shot.url },
              })
              return {
                target_id: media.id,
                target: { name: '', cover: media.src },
                attributes: { sexual: shot.sexual, violence: shot.violence },
              }
            } catch {
              return null
            }
          }),
        )
        let order = 0
        for (const row of rows) {
          if (!row) continue
          emit('add', 'images', {
            ...row,
            attributes: { ...row.attributes, order: order++ },
          })
        }
      }
      if (props.author && authorPicked.value && refApply) {
        const entity =
          props.author.matched_id != null
            ? {
                id: props.author.matched_id,
                name: props.author.name,
                cover: props.author.cover ?? null,
              }
            : await importProvisionalEntity({ type: 'person', external: props.author.external })
        if (entity) {
          refApply.value = {
            field: 'author_id',
            id: entity.id,
            entity: { name: entity.name, cover: entity.cover },
          }
        }
      }
      emit('applied')
    } finally {
      applying.value = false
    }
  }

  defineExpose({ apply, applying })
</script>

<template>
  <Stack gap="lg">
    <Text size="xs" tone="muted">已对比外部源：{{ comparedSources }}（仅列出有差异的字段）</Text>

    <Stack v-if="scalars.length" as="section" gap="sm">
      <Text size="xs" tone="muted">
        勾选要采用外部源值的字段。空字段默认勾选；已有值的字段（冲突）默认不勾，需手动确认覆盖。
      </Text>
      <Inline v-for="c in scalars" :key="c.field" gap="sm" align="start" :wrap="false">
        <Checkbox
          :model-value="pickedScalars.includes(c.field)"
          :aria-label="labelOf(c.field)"
          class="mt-3 shrink-0"
          @update:model-value="on => toggleScalar(c.field, on)"
        />
        <Stack gap="none" class="pointer-events-none min-w-0 flex-1">
          <CreatorChangesetFieldDiff :op="scalarOp(c)" :label="labelOf(c.field)" />
        </Stack>
        <Tag v-if="sourceLabel(c.source)" size="sm" tone="neutral" class="mt-2 shrink-0">
          {{ sourceLabel(c.source) }}
        </Tag>
      </Inline>
    </Stack>

    <Stack v-if="cover" as="section" gap="xs">
      <Checkbox v-model="coverPicked">使用外部源图片作为条目图</Checkbox>
    </Stack>

    <Stack v-if="tags.length" as="section" gap="sm">
      <Heading :level="3" size="sm">标签</Heading>
      <CheckboxGroup v-model="pickedTags" :options="tagOptions" orientation="horizontal" />
    </Stack>

    <Stack v-if="screenshots.length" as="section" gap="xs">
      <Checkbox v-model="screenshotsPicked">
        导入 {{ screenshots.length }} 张游戏截图（VNDB，含分级）
      </Checkbox>
    </Stack>

    <Inline v-if="author" as="section" gap="sm" align="center">
      <Checkbox v-model="authorPicked">设置作者为 {{ author.name }}</Checkbox>
      <Tag v-if="author.matched_id == null" size="sm" tone="warning" class="shrink-0">待导入</Tag>
    </Inline>

    <Stack v-if="rels.length" as="section" gap="sm">
      <Heading :level="3" size="sm">{{ relationLabel }}</Heading>
      <Inline v-for="r in rels" :key="r.target_id" gap="sm" align="start" :wrap="false">
        <Checkbox
          :model-value="pickedRels.includes(r.target_id)"
          :aria-label="r.name"
          class="mt-3 shrink-0"
          @update:model-value="on => toggleRel(r.target_id, on)"
        />
        <Stack gap="none" class="pointer-events-none min-w-0 flex-1">
          <CreatorChangesetFieldDiff :op="relationOp(r)" :label="relationLabel" />
        </Stack>
        <Tag size="sm" tone="neutral" class="mt-2 shrink-0">{{ sourceLabel(r.source) }}</Tag>
      </Inline>
    </Stack>
  </Stack>
</template>

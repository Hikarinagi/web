<script setup lang="ts">
  import type { FormInstance } from '@primevue/forms/form'
  import { REF_APPLY_KEY } from '~/features/creator/composables/useChangeRequestEditor'
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
    formEl: FormInstance | null
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

  const dateFields = computed(
    () => new Set(props.fields.filter(f => f.value_type === 'date').map(f => f.field)),
  )
  const labelOf = (field: string) => props.presentation[field]?.label ?? field
  const relationLabel = computed(
    () => (props.relationField && props.presentation[props.relationField]?.label) || '关联作品',
  )
  const sourceLabel = (s?: string) => (s === 'vndb' ? 'VNDB' : s === 'bangumi' ? 'Bangumi' : '')

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
        props.formEl?.setFieldValue(c.field, value)
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
        props.formEl?.setFieldValue(props.coverField, { id: media.id, src: media.src })
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
</script>

<template>
  <div class="flex flex-col gap-5">
    <p class="text-xs text-muted-color">
      已对比外部源：{{ comparedSources }}（仅列出有差异的字段）
    </p>

    <section v-if="scalars.length" class="flex flex-col gap-3">
      <p class="text-xs text-muted-color">
        勾选要采用外部源值的字段。空字段默认勾选；已有值的字段（冲突）默认不勾，需手动确认覆盖。
      </p>
      <label v-for="c in scalars" :key="c.field" class="flex cursor-pointer items-start gap-2">
        <Checkbox v-model="pickedScalars" :value="c.field" class="mt-3 shrink-0" />
        <div class="pointer-events-none min-w-0 flex-1">
          <CreatorChangesetFieldDiff :op="scalarOp(c)" :label="labelOf(c.field)" />
        </div>
        <Tag
          v-if="sourceLabel(c.source)"
          :value="sourceLabel(c.source)"
          severity="secondary"
          class="mt-2 shrink-0"
        />
      </label>
    </section>

    <section v-if="cover" class="flex flex-col gap-2">
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox v-model="coverPicked" binary class="shrink-0" />
        使用外部源图片作为条目图
      </label>
    </section>

    <section v-if="tags.length" class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold">标签</h3>
      <div class="flex flex-wrap gap-2">
        <label
          v-for="tag in tags"
          :key="tag.matched_id"
          class="flex cursor-pointer items-center gap-1.5 rounded-full border border-surface py-1 pr-3 pl-2 text-sm"
        >
          <Checkbox v-model="pickedTags" :value="tag.matched_id" class="shrink-0" />
          {{ tag.name }}
        </label>
      </div>
    </section>

    <section v-if="screenshots.length" class="flex flex-col gap-2">
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox v-model="screenshotsPicked" binary class="shrink-0" />
        导入 {{ screenshots.length }} 张游戏截图（VNDB，含分级）
      </label>
    </section>

    <section v-if="author" class="flex flex-col gap-2">
      <label class="flex cursor-pointer items-center gap-2 text-sm">
        <Checkbox v-model="authorPicked" binary class="shrink-0" />
        <span>设置作者为</span>
        <span class="font-medium">{{ author.name }}</span>
        <Tag
          v-if="author.matched_id == null"
          value="待导入"
          severity="warn"
          class="shrink-0 text-[10px]!"
        />
      </label>
    </section>

    <section v-if="rels.length" class="flex flex-col gap-3">
      <h3 class="text-sm font-semibold">{{ relationLabel }}</h3>
      <label v-for="r in rels" :key="r.target_id" class="flex cursor-pointer items-start gap-2">
        <Checkbox v-model="pickedRels" :value="r.target_id" class="mt-3 shrink-0" />
        <div class="pointer-events-none min-w-0 flex-1">
          <CreatorChangesetFieldDiff :op="relationOp(r)" :label="relationLabel" />
        </div>
        <Tag :value="sourceLabel(r.source)" severity="secondary" class="mt-2 shrink-0" />
      </label>
    </section>

    <div class="flex justify-end gap-3">
      <Button label="应用所选" :loading="applying" @click="apply" />
    </div>
  </div>
</template>

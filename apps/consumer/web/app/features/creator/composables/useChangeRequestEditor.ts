import type { FormSubmitEvent } from '@primevue/forms/form'
import { valibotResolver } from '@primevue/forms/resolvers/valibot'
import { push } from 'notivue'
import type { InjectionKey, Ref } from 'vue'
import type { BackendChangeRequestDetail } from '~/features/creator/contribution'
import type { BackendEditorRef, BackendEditorSchema } from '~/features/creator/editor'
import { needsReviewFor, type Changeset } from '~/features/creator/editor/changeset'
import { applyChangeset } from '~/features/creator/editor/applyChangeset'
import { diffSnapshot } from '~/features/creator/editor/diffSnapshot'
import { toRelationRows, type EditorRelationRow } from '~/features/creator/editor/relation'
import { validateRelations as runRelationValidation } from '~/features/creator/editor/relation-validation'
import type { EditorFieldPresentation } from '~/features/creator/editor/presentation'
import { schemaToValibot } from '~/features/creator/editor/schemaToValibot'
import { scrollToFirstError } from '~/features/creator/editor/scroll-to-error'

export const PICKED_REF_REGISTER_KEY: InjectionKey<
  (field: string, entity: BackendEditorRef) => void
> = Symbol('hikari-picked-ref-register')

export interface RefApplyPayload {
  field: string
  id: number
  entity: { name: string; cover: string | null }
}

export const REF_APPLY_KEY: InjectionKey<Ref<RefApplyPayload | null>> = Symbol('hikari-ref-apply')

interface ChangeRequestBody {
  summary: string
  changeset: Record<string, unknown>[]
}

// /api/v3/change-requests 同时有 GET(列表)和 POST(新建),hikariRequest 不按 method 收窄返回,
// 故显式标注为 CR 详情(POST 的实际返回)。
function postCreate(
  resourceType: BackendEditorSchema['resource_type'],
  body: ChangeRequestBody,
): Promise<BackendChangeRequestDetail> {
  return hikariRequest('/api/v3/change-requests', {
    method: 'POST',
    body: { resource_type: resourceType, ...body },
  }) as Promise<BackendChangeRequestDetail>
}

function postChangeRequest(resourceType: string, id: number, body: ChangeRequestBody) {
  const options = { method: 'POST', path: { id }, body } as const
  switch (resourceType) {
    case 'galgame':
      return hikariRequest('/api/v3/galgames/{id}/change-requests', options)
    case 'light-novel':
      return hikariRequest('/api/v3/light-novels/{id}/change-requests', options)
    case 'light-novel-volume':
      return hikariRequest('/api/v3/light-novel-volumes/{id}/change-requests', options)
    case 'manga':
      return hikariRequest('/api/v3/mangas/{id}/change-requests', options)
    case 'manga-volume':
      return hikariRequest('/api/v3/manga-volumes/{id}/change-requests', options)
    case 'person':
      return hikariRequest('/api/v3/people/{id}/change-requests', options)
    case 'producer':
      return hikariRequest('/api/v3/producers/{id}/change-requests', options)
    case 'character':
      return hikariRequest('/api/v3/characters/{id}/change-requests', options)
    case 'tag':
      return hikariRequest('/api/v3/tags/{id}/change-requests', options)
    default:
      throw new Error(`未知条目类型: ${resourceType}`)
  }
}

export function useChangeRequestEditor(params: {
  resourceType: string
  resourceId: number | null
  schema: BackendEditorSchema
  snapshot: Record<string, unknown>
  // 新建预填:作为初始表单值,但 diff 基线仍是(空)snapshot,故预填字段全部计入 changeset。
  prefill?: Record<string, unknown>
  snapshotRefs: Record<string, BackendEditorRef>
  openChangeRequest: BackendChangeRequestDetail | null
  presentation?: Record<string, EditorFieldPresentation>
  onSubmitted?: (result: BackendChangeRequestDetail) => void
  stagedChangeset?: Changeset | null
  onReview?: (changeset: Changeset, needsReview: boolean) => boolean
  fieldIdPrefix?: string
}) {
  const submitting = ref(false)
  const dialogOpen = ref(false)
  const changeset = ref<Changeset>([])
  const relationErrors = ref<Record<string, string>>({})
  const submitAttempted = ref(false)

  const openCr = params.openChangeRequest
  const resolver = valibotResolver(schemaToValibot(params.schema, params.presentation))
  // JSON 在线缆把 Date 序列化成 ISO 字符串,本机收到后在 form 入口一次性还原回 Date,
  // 让 DatePicker / valibot / diff 在 PrimeVue Forms 子树里全程跑 Date 语义。
  const dateFields = new Set(
    params.schema.fields
      .filter(field => field.kind === 'scalar' && field.value_type === 'date')
      .map(field => field.field),
  )
  function hydrateDates(input: Record<string, unknown>) {
    for (const field of dateFields) {
      const value = input[field]
      if (typeof value === 'string' && value) input[field] = new Date(value)
    }
    return input
  }
  const snapshot = hydrateDates(JSON.parse(JSON.stringify(params.snapshot)))
  const prefill = hydrateDates(JSON.parse(JSON.stringify(params.prefill ?? params.snapshot)))
  const rawRehydrateOps = params.stagedChangeset ?? openCr?.payload
  const rehydrateOps = rawRehydrateOps
    ? (JSON.parse(JSON.stringify(rawRehydrateOps)) as BackendChangeRequestDetail['payload'])
    : undefined
  const initialValues = rehydrateOps
    ? hydrateDates(applyChangeset(snapshot, rehydrateOps))
    : { ...prefill }

  for (const field of params.schema.fields) {
    if (field.kind !== 'scalar' || field.value_type !== 'boolean') continue
    if (snapshot[field.field] === undefined) snapshot[field.field] = false
    if (initialValues[field.field] === undefined) initialValues[field.field] = false
  }

  // 续编时,把 openCr payload 里 scalar ref op 已记录的 to_name/to_cover 当作该字段的初始实体,
  // 否则 RefField 拿到的还是 snapshot 的旧实体,会跟实际 FK 不匹配。
  const initialRefs = ((): Record<string, BackendEditorRef> => {
    const out: Record<string, BackendEditorRef> = { ...params.snapshotRefs }
    if (!rehydrateOps) return out
    for (const raw of rehydrateOps) {
      const op = raw as {
        kind?: unknown
        field?: unknown
        value_type?: unknown
        to_name?: unknown
        to_cover?: unknown
        to?: unknown
      }
      if (op?.kind !== 'scalar' || typeof op.field !== 'string') continue
      if (op.value_type !== 'ref') continue
      if (op.to == null) {
        out[op.field] = null
        continue
      }
      if (typeof op.to_name === 'string') {
        out[op.field] = {
          name: op.to_name,
          cover: typeof op.to_cover === 'string' ? op.to_cover : null,
        }
      }
    }
    return out
  })()

  const pickedRefs = ref<Record<string, BackendEditorRef>>({ ...initialRefs })
  function setPickedRef(field: string, entity: BackendEditorRef) {
    pickedRefs.value = { ...pickedRefs.value, [field]: entity }
  }
  provide(PICKED_REF_REGISTER_KEY, setPickedRef)

  const refApply = ref<RefApplyPayload | null>(null)
  provide(REF_APPLY_KEY, refApply)

  // 关系字段不进 PrimeVue Form:FormField 会让子树里所有 PrimeVue 输入自动绑定到字段值,
  // 而关系字段内含多个输入控件。改由这里单独持有关系草稿。
  const relations = ref<Record<string, EditorRelationRow[]>>(
    Object.fromEntries(
      params.schema.fields
        .filter(field => field.kind === 'relation')
        .map(field => [field.field, toRelationRows(initialValues[field.field])]),
    ),
  )
  const initialRelations = structuredClone(toRaw(relations.value))

  // reset 按钮 / 逐字段还原的基线是实体原始 snapshot,而非叠加了暂存/续编改动的 initialValues,
  // 否则已暂存的改动会被当成基线、显示不出「已改动」也无法还原到原值。
  const snapshotRelations = Object.fromEntries(
    params.schema.fields
      .filter(field => field.kind === 'relation')
      .map(field => [field.field, toRelationRows(snapshot[field.field])]),
  )

  // 首次提交后,关系修改实时回灌错误状态,跟 PrimeVue Form 的 scalar 行为对齐
  watch(
    relations,
    () => {
      if (submitAttempted.value) {
        relationErrors.value = runRelationValidation(params.schema.fields, relations.value)
      }
    },
    { deep: true },
  )

  const { can } = useCreatorPermissions()
  const needsReview = computed(() => needsReviewFor(changeset.value, params.schema.fields, can))

  function buildChangeset(fieldValues: Record<string, unknown>): Changeset {
    return diffSnapshot(
      snapshot,
      { ...snapshot, ...fieldValues, ...relations.value },
      params.schema.fields,
      { initial: params.snapshotRefs, current: pickedRefs.value },
    )
  }

  function buildFromForm(formState: Record<string, { value?: unknown } | undefined>): Changeset {
    const fieldValues: Record<string, unknown> = {}
    for (const [name, state] of Object.entries(formState)) {
      fieldValues[name] = state?.value
    }
    return buildChangeset(fieldValues)
  }

  function changedCount(formState: Record<string, { value?: unknown } | undefined>): number {
    return buildFromForm(formState).length
  }

  function changedFields(formState: Record<string, { value?: unknown } | undefined>): Set<string> {
    return new Set(
      buildFromForm(formState).map(op => (op.kind === 'scalar' ? op.field : op.relation)),
    )
  }

  function review(event: FormSubmitEvent) {
    if (submitting.value) return
    submitAttempted.value = true
    const errors = runRelationValidation(params.schema.fields, relations.value)
    relationErrors.value = errors
    if (!event.valid || Object.keys(errors).length > 0) {
      scrollToFirstError(params.schema.fields, event.states, errors, params.fieldIdPrefix)
      return
    }
    const next = buildChangeset(event.values as Record<string, unknown>)
    changeset.value = next
    if (params.onReview?.(next, needsReview.value)) return
    if (next.length === 0) {
      push.info({ message: '没有检测到任何修改' })
      return
    }
    dialogOpen.value = true
  }

  async function confirm(summary: string) {
    if (submitting.value || changeset.value.length === 0) return
    submitting.value = true
    try {
      const body: ChangeRequestBody = {
        summary: summary.trim(),
        changeset: changeset.value as unknown as Record<string, unknown>[],
      }
      const result = openCr
        ? await hikariRequest('/api/v3/change-requests/{id}', {
            method: 'PATCH',
            path: { id: openCr.id },
            body,
          })
        : params.resourceId !== null
          ? await postChangeRequest(params.resourceType, params.resourceId, body)
          : await postCreate(params.schema.resource_type, body)
      if (params.onSubmitted) params.onSubmitted(result as BackendChangeRequestDetail)
      else await navigateTo(`/create/contributions/${result.id}`)
    } finally {
      submitting.value = false
    }
  }

  return {
    resolver,
    initialValues,
    initialRelations,
    snapshotValues: snapshot,
    snapshotRelations,
    initialRefs,
    relations,
    relationErrors,
    isContinue: !!openCr,
    submitting,
    changeset,
    dialogOpen,
    needsReview,
    review,
    confirm,
    changedCount,
    changedFields,
    setPickedRef,
  }
}

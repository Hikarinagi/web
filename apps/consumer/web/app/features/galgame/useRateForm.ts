import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import { galgameRateResolver, type GalgameRateValues } from './schemas/rate.schema'
import { GALGAME_RATE_DIMENSIONS, type GalgameRate, type UpsertGalgameRateBody } from './rate'

interface RateFormOptions {
  rate: () => GalgameRate | null
  workTitle: () => string
  upsert: (body: UpsertGalgameRateBody) => Promise<GalgameRate | null>
  remove: () => Promise<unknown>
  close: () => void
  onReview?: (rate: GalgameRate | null) => void
}

export function useRateForm(opts: RateFormOptions) {
  const confirm = useConfirm()
  const formErrors = useFormErrors(galgameRateResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const detailOpen = ref(false)
  const pendingReview = ref(false)
  const reviewing = ref(false)

  const isEdit = computed(() => {
    const r = opts.rate()
    return r != null && (r.rate != null || r.status != null)
  })
  const title = computed(() => `编辑《${opts.workTitle()}》的状态`)

  const initialValues = computed(() => {
    const r = opts.rate()
    return {
      status: r?.status && r.status !== 'PLAN' ? r.status : 'GOING',
      rate: r?.rate ?? null,
      rate_content: r?.rate_content ?? '',
      time_to_finish_hours: r?.time_to_finish_minutes
        ? Math.round((r.time_to_finish_minutes / 60) * 10) / 10
        : null,
      is_spoiler: r?.is_spoiler ?? false,
      status_private: r?.status_private ?? false,
      rate_scenario: r?.rate_scenario ?? null,
      rate_direction: r?.rate_direction ?? null,
      rate_music: r?.rate_music ?? null,
      rate_visual: r?.rate_visual ?? null,
      rate_character: r?.rate_character ?? null,
      rate_system: r?.rate_system ?? null,
    }
  })

  function prepare() {
    formErrors.clear()
    detailOpen.value = GALGAME_RATE_DIMENSIONS.some(
      d => opts.rate()?.[d.key as keyof GalgameRate] != null,
    )
  }

  async function submit(event: FormSubmitEvent) {
    const review = pendingReview.value
    pendingReview.value = false
    if (!event.valid || submitting.value) return
    submitting.value = true
    reviewing.value = review
    try {
      const v = event.values as GalgameRateValues
      const saved = await opts.upsert({
        status: v.status,
        rate: v.rate,
        rate_content: v.rate_content ?? '',
        time_to_finish_minutes:
          v.time_to_finish_hours != null ? Math.round(v.time_to_finish_hours * 60) : 0,
        is_spoiler: v.is_spoiler,
        status_private: v.status_private,
        rate_scenario: v.rate_scenario,
        rate_direction: v.rate_direction,
        rate_music: v.rate_music,
        rate_visual: v.rate_visual,
        rate_character: v.rate_character,
        rate_system: v.rate_system,
      })
      if (review) opts.onReview?.(saved)
      else opts.close()
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
      reviewing.value = false
    }
  }

  function confirmClearScore() {
    confirm.require({
      group: 'app-shell',
      header: '清除评分',
      message: '清除后只保留标记，评分与短评会移除。确定吗？',
      acceptLabel: '清除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        await opts.upsert({ rate: null, rate_content: '', is_spoiler: false })
        opts.close()
      },
    })
  }

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '移除状态',
      message: '移除后，你对这部作品的标记、评分与短评都会删除。确定吗？',
      acceptLabel: '移除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        await opts.remove()
        opts.close()
      },
    })
  }

  return {
    formErrors,
    form,
    submitting,
    detailOpen,
    pendingReview,
    reviewing,
    isEdit,
    title,
    initialValues,
    prepare,
    submit,
    confirmClearScore,
    confirmDelete,
  }
}

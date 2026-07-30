import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import { lightNovelRateResolver, type LightNovelRateValues } from './schemas/rate.schema'
import {
  LIGHT_NOVEL_RATE_DIMENSIONS,
  type LightNovelRate,
  type UpsertLightNovelRateBody,
} from './rate'

interface RateFormOptions {
  rate: () => LightNovelRate | null
  workTitle: () => string
  upsert: (body: UpsertLightNovelRateBody) => Promise<LightNovelRate | null>
  remove: () => Promise<unknown>
  close: () => void
  onReview?: (rate: LightNovelRate | null) => void
}

export function useRateForm(opts: RateFormOptions) {
  const confirm = useConfirm()
  const formErrors = useFormErrors(lightNovelRateResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)
  const detailOpen = ref(false)
  const pendingReview = ref(false)
  const reviewing = ref(false)

  const isEdit = computed(() => opts.rate()?.rate != null)
  const title = computed(() =>
    isEdit.value ? `编辑《${opts.workTitle()}》的打分` : `给《${opts.workTitle()}》打分`,
  )

  const initialValues = computed(() => {
    const r = opts.rate()
    return {
      status: r?.status && r.status !== 'PLAN' ? r.status : 'GOING',
      rate: r?.rate ?? 8,
      rate_content: r?.rate_content ?? '',
      time_to_finish_hours: r?.time_to_finish_minutes
        ? Math.round((r.time_to_finish_minutes / 60) * 10) / 10
        : null,
      is_spoiler: r?.is_spoiler ?? false,
      rate_plot: r?.rate_plot ?? null,
      rate_character: r?.rate_character ?? null,
      rate_writing: r?.rate_writing ?? null,
      rate_worldview: r?.rate_worldview ?? null,
      rate_pacing: r?.rate_pacing ?? null,
      rate_illustration: r?.rate_illustration ?? null,
    }
  })

  function prepare() {
    formErrors.clear()
    detailOpen.value = LIGHT_NOVEL_RATE_DIMENSIONS.some(
      d => opts.rate()?.[d.key as keyof LightNovelRate] != null,
    )
  }

  async function submit(event: FormSubmitEvent) {
    const review = pendingReview.value
    pendingReview.value = false
    if (!event.valid || submitting.value) return
    submitting.value = true
    reviewing.value = review
    try {
      const v = event.values as LightNovelRateValues
      const saved = await opts.upsert({
        status: v.status,
        rate: v.rate,
        rate_content: v.rate_content ?? '',
        time_to_finish_minutes:
          v.time_to_finish_hours != null ? Math.round(v.time_to_finish_hours * 60) : 0,
        is_spoiler: v.is_spoiler,
        rate_plot: v.rate_plot,
        rate_character: v.rate_character,
        rate_writing: v.rate_writing,
        rate_worldview: v.rate_worldview,
        rate_pacing: v.rate_pacing,
        rate_illustration: v.rate_illustration,
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

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '删除评分',
      message: '删除后,你对这部作品的评分与状态都会移除。确定删除吗?',
      acceptLabel: '删除',
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
    confirmDelete,
  }
}

import type { Form } from '@hina-ui/vue'
import { lightNovelRateSchema, type LightNovelRateValues } from './schemas/rate.schema'
import {
  LIGHT_NOVEL_RATE_DIMENSIONS,
  type LightNovelRate,
  type UpsertLightNovelRateBody,
} from './rate'
import { getFieldErrors } from '~/utils/api/error'

interface RateFormOptions {
  rate: () => LightNovelRate | null
  workTitle: () => string
  upsert: (body: UpsertLightNovelRateBody) => Promise<LightNovelRate | null>
  remove: () => Promise<unknown>
  close: () => void
  onReview?: (rate: LightNovelRate | null) => void
}

export function useRateForm(opts: RateFormOptions) {
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const detailOpen = ref(false)
  const reviewing = ref(false)

  const values = reactive<LightNovelRateValues>({
    status: 'GOING',
    rate: null,
    rate_content: '',
    time_to_finish_hours: null,
    is_spoiler: false,
    status_private: false,
    rate_plot: null,
    rate_character: null,
    rate_writing: null,
    rate_worldview: null,
    rate_pacing: null,
    rate_illustration: null,
  })

  const isEdit = computed(() => {
    const r = opts.rate()
    return r != null && (r.rate != null || r.status != null)
  })
  const title = computed(() => `编辑《${opts.workTitle()}》的状态`)

  async function prepare() {
    const r = opts.rate()
    values.status = r?.status && r.status !== 'PLAN' ? r.status : 'GOING'
    values.rate = r?.rate ?? null
    values.rate_content = r?.rate_content ?? ''
    values.time_to_finish_hours = r?.time_to_finish_minutes
      ? Math.round((r.time_to_finish_minutes / 60) * 10) / 10
      : null
    values.is_spoiler = r?.is_spoiler ?? false
    values.status_private = r?.status_private ?? false
    values.rate_plot = r?.rate_plot ?? null
    values.rate_character = r?.rate_character ?? null
    values.rate_writing = r?.rate_writing ?? null
    values.rate_worldview = r?.rate_worldview ?? null
    values.rate_pacing = r?.rate_pacing ?? null
    values.rate_illustration = r?.rate_illustration ?? null
    detailOpen.value = LIGHT_NOVEL_RATE_DIMENSIONS.some(
      d => r?.[d.key as keyof LightNovelRate] != null,
    )
    await nextTick()
    form.value?.reset()
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    try {
      const saved = await opts.upsert({
        status: values.status,
        rate: values.rate,
        rate_content: values.rate_content.trim(),
        time_to_finish_minutes:
          values.time_to_finish_hours != null ? Math.round(values.time_to_finish_hours * 60) : 0,
        is_spoiler: values.is_spoiler,
        status_private: values.status_private,
        rate_plot: values.rate_plot,
        rate_character: values.rate_character,
        rate_writing: values.rate_writing,
        rate_worldview: values.rate_worldview,
        rate_pacing: values.rate_pacing,
        rate_illustration: values.rate_illustration,
      })
      if (reviewing.value) opts.onReview?.(saved)
      else opts.close()
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }

  function setDimension(key: string, value: number | null) {
    Object.assign(values, { [key]: value })
  }

  async function save(review = false) {
    reviewing.value = review
    try {
      await form.value?.submit()
    } finally {
      reviewing.value = false
    }
  }

  async function clearScore() {
    await opts.upsert({ rate: null, rate_content: '', is_spoiler: false })
    opts.close()
  }

  async function removeStatus() {
    await opts.remove()
    opts.close()
  }

  return {
    form,
    values,
    rules: lightNovelRateSchema,
    submitting,
    detailOpen,
    reviewing,
    isEdit,
    title,
    prepare,
    submit,
    save,
    setDimension,
    clearScore,
    removeStatus,
  }
}

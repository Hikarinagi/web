import type { Form } from '@hina-ui/vue'
import { galgameRateSchema, type GalgameRateValues } from './schemas/rate.schema'
import { GALGAME_RATE_DIMENSIONS, type GalgameRate, type UpsertGalgameRateBody } from './rate'
import { getFieldErrors } from '~/utils/api/error'

interface RateFormOptions {
  rate: () => GalgameRate | null
  workTitle: () => string
  upsert: (body: UpsertGalgameRateBody) => Promise<GalgameRate | null>
  remove: () => Promise<unknown>
  close: () => void
  onReview?: (rate: GalgameRate | null) => void
}

export function useRateForm(opts: RateFormOptions) {
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const detailOpen = ref(false)
  const reviewing = ref(false)

  const values = reactive<GalgameRateValues>({
    status: 'GOING',
    rate: null,
    rate_content: '',
    time_to_finish_hours: null,
    is_spoiler: false,
    status_private: false,
    rate_scenario: null,
    rate_direction: null,
    rate_music: null,
    rate_visual: null,
    rate_character: null,
    rate_system: null,
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
    values.rate_scenario = r?.rate_scenario ?? null
    values.rate_direction = r?.rate_direction ?? null
    values.rate_music = r?.rate_music ?? null
    values.rate_visual = r?.rate_visual ?? null
    values.rate_character = r?.rate_character ?? null
    values.rate_system = r?.rate_system ?? null
    detailOpen.value = GALGAME_RATE_DIMENSIONS.some(d => r?.[d.key as keyof GalgameRate] != null)
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
        rate_scenario: values.rate_scenario,
        rate_direction: values.rate_direction,
        rate_music: values.rate_music,
        rate_visual: values.rate_visual,
        rate_character: values.rate_character,
        rate_system: values.rate_system,
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
    rules: galgameRateSchema,
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

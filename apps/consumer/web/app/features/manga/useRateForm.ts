import type { Form } from '@hina-ui/vue'
import { mangaRateSchema, type MangaRateValues } from './schemas/rate.schema'
import type { MangaRate, UpsertMangaRateBody } from './rate'
import { getFieldErrors } from '~/utils/api/error'

interface RateFormOptions {
  rate: () => MangaRate | null
  workTitle: () => string
  upsert: (body: UpsertMangaRateBody) => Promise<MangaRate | null>
  remove: () => Promise<unknown>
  close: () => void
}

export function useRateForm(opts: RateFormOptions) {
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)

  const values = reactive<MangaRateValues>({
    status: 'GOING',
    rate: null,
    rate_content: '',
    is_spoiler: false,
    status_private: false,
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
    values.is_spoiler = r?.is_spoiler ?? false
    values.status_private = r?.status_private ?? false
    await nextTick()
    form.value?.reset()
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    try {
      await opts.upsert({
        status: values.status,
        rate: values.rate,
        rate_content: values.rate_content.trim(),
        is_spoiler: values.is_spoiler,
        status_private: values.status_private,
      })
      opts.close()
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
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
    rules: mangaRateSchema,
    submitting,
    isEdit,
    title,
    prepare,
    submit,
    clearScore,
    removeStatus,
  }
}

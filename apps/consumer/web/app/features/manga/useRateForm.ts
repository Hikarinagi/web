import type { FormInstance, FormSubmitEvent } from '@primevue/forms/form'
import { mangaRateResolver, type MangaRateValues } from './schemas/rate.schema'
import type { MangaRate, UpsertMangaRateBody } from './rate'

interface RateFormOptions {
  rate: () => MangaRate | null
  workTitle: () => string
  upsert: (body: UpsertMangaRateBody) => Promise<MangaRate | null>
  remove: () => Promise<unknown>
  close: () => void
}

export function useRateForm(opts: RateFormOptions) {
  const confirm = useConfirm()
  const formErrors = useFormErrors(mangaRateResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

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
      is_spoiler: r?.is_spoiler ?? false,
      status_private: r?.status_private ?? false,
    }
  })

  async function submit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const values = event.values as MangaRateValues
      await opts.upsert({
        status: values.status,
        rate: values.rate,
        rate_content: values.rate_content ?? '',
        is_spoiler: values.is_spoiler,
        status_private: values.status_private,
      })
      opts.close()
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
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
    isEdit,
    title,
    initialValues,
    submit,
    confirmClearScore,
    confirmDelete,
  }
}

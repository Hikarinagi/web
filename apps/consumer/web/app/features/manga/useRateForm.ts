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
      is_spoiler: r?.is_spoiler ?? false,
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
      })
      opts.close()
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }

  function confirmDelete() {
    confirm.require({
      group: 'app-shell',
      header: '删除评分',
      message: '删除后，你对这部作品的评分与状态都会移除。确定删除吗？',
      acceptLabel: '删除',
      rejectLabel: '再想想',
      onAccept: async ({ close }: { close: () => void }) => {
        close()
        await opts.remove()
        opts.close()
      },
    })
  }

  return { formErrors, form, submitting, isEdit, title, initialValues, submit, confirmDelete }
}

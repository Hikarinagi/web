import type { FormInstance, FormResolverOptions } from '@primevue/forms/form'
import { readonly, ref } from 'vue'

import { getFieldErrors } from '~/utils/api/error'

type FormResolveResult = {
  values?: unknown
  errors?: Record<string, unknown[]>
}

type FormResolver = (options: FormResolverOptions) => FormResolveResult | Promise<FormResolveResult>

export function useFormErrors(baseResolver: FormResolver) {
  const fieldErrors = ref<Record<string, string>>({})

  async function resolver(options: FormResolverOptions) {
    const result = await baseResolver(options)
    const entries = Object.entries(fieldErrors.value)
    if (!entries.length) return result

    const errors = { ...(result.errors ?? {}) }
    for (const [field, message] of entries) {
      errors[field] = [{ message }]
    }

    return {
      ...result,
      errors,
    }
  }

  async function set(errors: Record<string, string>, form?: FormInstance | null) {
    fieldErrors.value = errors

    const fields = Object.keys(errors)
    if (form && fields.length) {
      await form.validate(fields)
    }
  }

  async function apply(error: unknown, form?: FormInstance | null) {
    await set(getFieldErrors(error), form)
  }

  function clear() {
    fieldErrors.value = {}
  }

  return {
    apply,
    clear,
    fieldErrors: readonly(fieldErrors),
    resolver,
    set,
  }
}

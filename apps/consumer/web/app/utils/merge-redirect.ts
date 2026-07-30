import { isRecord } from '#shared/utils/record'

/**
 * A wiki de-dup merge deletes the duplicate row, so its id would otherwise 404 forever. The page
 * BFF answers such an id with `{ redirect_to }` instead; call this immediately after the page data
 * await so the redirect resolves before the template can render. On the server `navigateTo` emits
 * a real 301, on client navigation it swaps the route in place.
 */
export async function redirectIfMerged(data: Ref<unknown>): Promise<void> {
  const value = data.value
  if (!isRecord(value) || typeof value.redirect_to !== 'string') return
  await navigateTo(value.redirect_to, { replace: true, redirectCode: 301 })
}

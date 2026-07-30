import { BProgress } from '@bprogress/core'

export default defineNuxtPlugin(nuxtApp => {
  BProgress.configure({
    showSpinner: true,
  })

  let active = 0

  nuxtApp.hook('page:loading:start', () => {
    active += 1
    if (active === 1) BProgress.start()
  })

  nuxtApp.hook('page:loading:end', () => {
    active = Math.max(0, active - 1)
    if (active === 0) BProgress.done()
  })

  nuxtApp.hook('app:error', () => {
    active = 0
    BProgress.done()
  })
})

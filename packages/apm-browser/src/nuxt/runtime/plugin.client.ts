import { defineNuxtPlugin, useRouter, useRuntimeConfig } from 'nuxt/app'

import { createApm } from '../../apm.js'
import { instrumentFetch } from '../../fetch.js'
import type { Apm } from '../../types.js'
import type { ApmRuntimeConfig } from '../module.js'
import { installApm } from './composables.js'
import { environmentOf } from './environment.js'

export default defineNuxtPlugin({
  name: 'apm',
  setup(nuxtApp) {
    const config = useRuntimeConfig().public.apm as Partial<ApmRuntimeConfig> | undefined
    if (!config?.endpoint || !config.key) return

    const endpoint = config.endpoint.replace(/\/$/, '')
    const apm: Apm = createApm({
      endpoint,
      key: config.key,
      service: config.service || 'hikari-web',
      version: String(useRuntimeConfig().public.appVersion ?? 'dev'),
      environment: environmentOf(window.location.hostname),
      sampleRate: Number(config.sampleRate ?? 0.05),
    })
    installApm(apm)
    apm.installGlobalHandlers()
    instrumentFetch(apm, {
      origin: window.location.origin,
      ignore: url => url.startsWith(endpoint),
    })

    nuxtApp.hook('vue:error', (error, _instance, info) => {
      apm.captureError(error, { 'vue.info': String(info) })
    })
    nuxtApp.hook('app:error', error => {
      apm.captureError(error, { 'nuxt.phase': 'app' })
    })
    nuxtApp.hook('app:created', () => {
      const router = useRouter()
      const view = (to: { path: string; fullPath: string }, referrer: string) =>
        apm.pageView({
          path: to.path,
          query: to.fullPath.includes('?') ? to.fullPath.slice(to.fullPath.indexOf('?')) : '',
          referrer,
        })
      router.afterEach((to, from) =>
        view(to, from.matched.length > 0 ? from.fullPath : document.referrer),
      )
      if (router.currentRoute.value.matched.length > 0)
        view(router.currentRoute.value, document.referrer)
    })

    return { provide: { apm } }
  },
})

declare module 'nuxt/app' {
  interface NuxtApp {
    $apm?: Apm
  }
}

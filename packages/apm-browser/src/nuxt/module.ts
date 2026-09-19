import { addImports, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  service: string
}

export interface ApmRuntimeConfig {
  endpoint: string
  key: string
  sampleRate: number
  service: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@hikarinagi/apm-browser',
    configKey: 'apm',
  },
  defaults: {
    service: 'hikari-web',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const current = (nuxt.options.runtimeConfig.public.apm ?? {}) as Partial<ApmRuntimeConfig>
    nuxt.options.runtimeConfig.public.apm = {
      endpoint: '',
      key: '',
      sampleRate: 0.05,
      service: options.service,
      ...current,
    } satisfies ApmRuntimeConfig
    addPlugin({ src: resolver.resolve('./runtime/plugin.client'), mode: 'client' })
    addImports({ name: 'useApm', from: resolver.resolve('./runtime/composables') })
  },
})

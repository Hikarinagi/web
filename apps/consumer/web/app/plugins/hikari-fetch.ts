// Internal raw fetch provider only. App code should use the public request
// entrypoints: useHikariApiData for page/BFF data, hikariRequest for user events.
export default defineNuxtPlugin({
  name: 'hikari-fetch',
  setup() {
    const config = useRuntimeConfig()

    const hikariFetch = $fetch.create({
      baseURL: config.public.apiBase,
      credentials: 'include',
      retry: false,
    })

    return {
      provide: {
        hikariFetch,
      },
    }
  },
})

declare module '#app' {
  interface NuxtApp {
    $hikariFetch: typeof globalThis.$fetch
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $hikariFetch: typeof globalThis.$fetch
  }
}

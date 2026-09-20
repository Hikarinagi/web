import { createRequire } from 'node:module'
import tailwindcss from '@tailwindcss/vite'
import HikarinagiTheme from './app/theme'
import zhCN from 'primelocale/zh-CN.json'

const requirePkg = createRequire(import.meta.url)
const ritoVersion = {
  core: (requirePkg('@ritojs/core/package.json') as { version: string }).version,
  kit: (requirePkg('@ritojs/kit/package.json') as { version: string }).version,
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxtjs/color-mode',
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/icon',
    'notivue/nuxt',
    'motion-v/nuxt',
    '@primevue/nuxt-module',
    '@vueuse/nuxt',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    'nuxt-schema-org',
  ],

  site: { url: 'https://www.hikarinagi.org', name: 'Hikarinagi' },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: 'Hikarinagi',
      sameAs: ['https://t.me/hikari_nagi', 'https://github.com/Hikarinagi'],
    },
  },

  sitemap: {
    defaultSitemapsChunkSize: 50000,
    sitemaps: {
      galgames: { sources: ['/api/__sitemap__/galgames'], chunks: true },
      'galgame-downloads': { sources: ['/api/__sitemap__/galgame-downloads'], chunks: true },
      'light-novels': { sources: ['/api/__sitemap__/light-novels'], chunks: true },
      'light-novel-volumes': { sources: ['/api/__sitemap__/light-novel-volumes'], chunks: true },
      mangas: { sources: ['/api/__sitemap__/mangas'], chunks: true },
      posts: { sources: ['/api/__sitemap__/posts'], chunks: true },
      articles: { sources: ['/api/__sitemap__/articles'], chunks: true },
      characters: { sources: ['/api/__sitemap__/characters'], chunks: true },
      people: { sources: ['/api/__sitemap__/people'], chunks: true },
      producers: { sources: ['/api/__sitemap__/producers'], chunks: true },
      topics: { sources: ['/api/__sitemap__/topics'], chunks: true },
      sections: { sources: ['/api/__sitemap__/sections'], chunks: true },
      pages: { urls: ['/', '/galgames', '/light-novels', '/mangas'] },
    },
  },

  robots: {
    disallow: ['/auth', '/login', '/register'],
  },

  icon: {
    serverBundle: {
      collections: ['simple-icons'],
    },
  },

  css: [
    '@bprogress/core/css',
    '~/assets/css/main.css',
    'notivue/notification.css',
    'notivue/animations.css',
  ],

  imports: {
    dirs: ['~/features/**/composables/*', '~/labels/*'],
    imports: [
      {
        from: '~/utils/api/hikari-request',
        name: 'hikariRequest',
      },
    ],
  },

  components: [
    {
      path: '~/components/ui',
      pathPrefix: false,
      pattern: '*.vue',
    },
    {
      path: '~/components',
      pattern: '**/*.vue',
      ignore: ['ui/**', 'hikari-editor/legacy/**'],
    },
  ],

  typescript: {
    tsConfig: {
      exclude: ['../app/components/hikari-editor/legacy/**'],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      exclude: ['@ritojs/core', '@ritojs/kit'],
    },
  },

  fonts: {
    families: [
      {
        name: 'Noto Sans SC',
        provider: 'google',
        weights: [400, 500, 600, 700],
        styles: ['normal'],
        global: true,
      },
      {
        name: 'JetBrains Mono',
        provider: 'google',
        weights: [400, 600, 800],
        styles: ['normal'],
      },
    ],
  },

  runtimeConfig: {
    apiBase: 'http://localhost:5003/api/v3',
    site: { indexable: true },
    oidc: {
      issuer: 'http://localhost:5010/oidc',
      clientId: 'consumer-web',
      redirectUri: 'http://localhost:3628/auth/callback',
      scopes: 'openid profile email offline_access',
    },
    public: {
      apiBase: '/api/v3',
      openApiBase: 'https://api.hikarinagi.org',
      wsBase: '',
      cdnHost: '',
      imageProcessorHost: '',
      ogServiceUrl: '',
      appVersion: process.env.APP_VERSION || 'dev',
      buildTime: process.env.BUILD_TIME || '',
      ritoVersion,
    },
  },

  colorMode: {
    preference: 'system',
    fallback: 'light',
    classPrefix: '',
    classSuffix: '',
    storage: 'cookie',
    storageKey: 'hikari-color-mode',
  },

  image: {
    provider: 'none',
  },

  primevue: {
    autoImport: false,
    components: {
      exclude: ['Editor', 'Chart', 'Image', 'ProgressSpinner'],
      name: item => {
        if (item.name === 'Button') return 'PrimeButton'
        if (item.name === 'Avatar') return 'PrimeAvatar'
        if (item.name === 'ConfirmDialog') return 'PrimeConfirmDialog'
        if (item.name === 'Dialog') return 'PrimeDialog'
        if (item.name === 'Paginator') return 'PrimePaginator'
        return item.name
      },
    },
    directives: {
      exclude: ['Tooltip'],
    },
    options: {
      ripple: true,
      theme: {
        preset: HikarinagiTheme,
        options: {
          darkModeSelector: '.dark',
        },
      },
      locale: zhCN['zh-CN'],
    },
  },

  notivue: {
    position: 'top-right',
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 5000,
      },
      error: {
        duration: 6000,
      },
    },
  },
})

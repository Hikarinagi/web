import type { MaybeRefOrGetter } from 'vue'
import { SITE_CONFIG } from '~/config/site'
import {
  SEO_DESCRIPTION_MAX_LENGTH,
  buildSeoTitle,
  resolveSeoUrl,
  toSeoText,
  type SeoSource,
} from '~/utils/seo'

export type OgCardType =
  | 'galgame'
  | 'light-novel'
  | 'light-novel-volume'
  | 'manga'
  | 'manga-volume'
  | 'post'
  | 'article'
  | 'person'
  | 'character'
  | 'producer'
  | 'user'
  | 'collection'

export interface HikariSeoMetaInput {
  title: MaybeRefOrGetter<SeoSource>
  headerTitle?: MaybeRefOrGetter<SeoSource>
  description?: MaybeRefOrGetter<SeoSource>
  card?: MaybeRefOrGetter<{ type: OgCardType; id: number | string } | null | undefined>
  path?: MaybeRefOrGetter<string | null | undefined>
  type?: MaybeRefOrGetter<'website' | 'article' | 'profile'>
  noindex?: MaybeRefOrGetter<boolean | null | undefined>
  appendSiteName?: MaybeRefOrGetter<boolean | null | undefined>
  schemaOrg?: MaybeRefOrGetter<Record<string, unknown>[] | null | undefined>
}

export function useHikariSeoMeta(input: HikariSeoMetaInput) {
  const route = useRoute()
  const config = useRuntimeConfig()
  const siteUrl = computed(() => String(config.public.siteUrl || ''))
  const title = computed(() =>
    buildSeoTitle(toValue(input.title), SITE_CONFIG.name, {
      appendSiteName: toValue(input.appendSiteName) ?? true,
    }),
  )

  // 把不带站点名的纯标题发布给全局 header(移动端「页面信息栏」消费)
  const headerTitle = useState<string>('hikari:header-title', () => '')
  const headerSource = input.headerTitle !== undefined ? input.headerTitle : input.title
  watch(
    () => buildSeoTitle(toValue(headerSource), SITE_CONFIG.name, { appendSiteName: false }),
    value => {
      headerTitle.value = value
    },
    { immediate: true },
  )

  const description = computed(() =>
    toSeoText(toValue(input.description), { maxLength: SEO_DESCRIPTION_MAX_LENGTH }),
  )
  const canonical = computed(() => resolveSeoUrl(toValue(input.path) ?? route.path, siteUrl.value))
  const ogServiceUrl = computed(() => String(config.public.ogServiceUrl || ''))
  const shareImage = computed(() => {
    const card = toValue(input.card)
    const base = ogServiceUrl.value.replace(/\/+$/, '')
    if (!base) return undefined
    if (card) return `${base}/og/${card.type}/${card.id}`
    return `${base}/og/default`
  })
  const noindex = computed(() => Boolean(toValue(input.noindex)))
  const type = computed(() => toValue(input.type) ?? 'website')

  useSeoMeta({
    title: () => title.value,
    description: () => description.value,
    ogTitle: () => title.value,
    ogDescription: () => description.value,
    ogImage: () => shareImage.value,
    ogUrl: () => canonical.value,
    ogType: () => type.value,
    twitterCard: () => (shareImage.value ? 'summary_large_image' : 'summary'),
    twitterTitle: () => title.value,
    twitterDescription: () => description.value,
    twitterImage: () => shareImage.value,
    robots: () => (noindex.value ? 'noindex, nofollow' : undefined),
  })

  useHead(() => ({
    link: canonical.value ? [{ rel: 'canonical', href: canonical.value }] : [],
  }))

  const schema = toValue(input.schemaOrg)
  if (schema?.length) useSchemaOrg(schema)

  return {
    canonical,
    description,
    title,
  }
}

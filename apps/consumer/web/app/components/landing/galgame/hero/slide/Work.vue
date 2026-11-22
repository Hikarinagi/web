<script setup lang="ts">
  import { Button, Divider, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { logoClass, stageLogo } from '~/features/galgame/logo'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { dayLabel, daysBetween } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'
  import { cn } from '~/utils/cn'

  type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]

  defineOptions({ name: 'LandingGalgameHeroSlideWork' })
  const props = defineProps<{
    item: NonNullable<Slide['work']>
    description: string | null
    today: string
  }>()

  const work = computed(() => galgameWork(props.item))
  const date = computed(() => props.item.release_date?.slice(0, 10) ?? null)
  const countdown = computed(() => {
    if (!date.value) return null
    const days = daysBetween(props.today, date.value)
    if (days > 0) return `还有 ${days} 天`
    return days === 0 ? '今天发售' : null
  })
  const platforms = computed(() =>
    sortPlatforms(props.item.platforms).map(platformLabel).join('、'),
  )
  const shown = computed(() => stageLogo(props.item.logos, props.item.language))
  const logo = computed(() => shown.value.logo)
  const titleClass = computed(() =>
    cn(shown.value.light && 'sr-only', shown.value.dark ? 'dark:sr-only' : 'dark:not-sr-only'),
  )
  const logoRatio = computed(() => {
    const { width, height } = logo.value?.media ?? {}
    return width && height ? width / height : undefined
  })
  const facts = computed(() =>
    [
      { key: 'maker', text: work.value.sub, lang: 'ja', fill: false, accent: null },
      {
        key: 'date',
        text: date.value ? `${dayLabel(date.value)}发售` : '',
        lang: undefined,
        fill: false,
        accent: countdown.value,
      },
      { key: 'platforms', text: platforms.value, lang: undefined, fill: true, accent: null },
    ].filter(fact => fact.text),
  )
  const subtitle = computed(() =>
    logo.value?.language === 'zh-Hans' ? work.value.original : work.value.title,
  )
  const withLogo = computed(() =>
    cn(!shown.value.light && 'hidden', shown.value.dark ? 'dark:block' : 'dark:hidden'),
  )
  const withoutLogo = computed(() =>
    cn(shown.value.light && 'hidden', shown.value.dark ? 'dark:hidden' : 'dark:block'),
  )
  const logoProcessing = { width: 960, quality: 90, fit: 'scale-down', format: 'auto' } as const
</script>

<template>
  <Stack gap="sm" class="min-w-0">
    <HikariImage
      v-if="logo"
      :src="logo.media"
      alt=""
      :ratio="logoRatio"
      :processing="logoProcessing"
      :skeleton="false"
      :thumbhash="false"
      :class="cn('h-(--landing-logo-height) max-w-full self-start', logoClass(logo))"
      image-class="size-full object-contain object-bottom-left"
    />
    <Heading
      :level="3"
      :class="
        cn(
          'line-clamp-2 text-2xl leading-tight font-semibold tracking-tight lg:text-4xl',
          titleClass,
        )
      "
    >
      {{ work.title }}
    </Heading>
    <Text v-if="logo && subtitle" size="lg" truncate :class="cn('text-fg/85', withLogo)">
      {{ subtitle }}
    </Text>
    <Text v-if="work.original" size="lg" truncate :class="cn('text-fg/85', withoutLogo)" lang="ja">
      {{ work.original }}
    </Text>
  </Stack>
  <Inline gap="md" align="center" class="min-w-0 gap-y-1 text-fg/75 sm:flex-nowrap">
    <template v-for="(fact, position) in facts" :key="fact.key">
      <Divider v-if="position" orientation="vertical" class="h-3.5 self-center max-sm:hidden" />
      <Inline gap="sm" align="center" :wrap="false" :class="fact.fill ? 'min-w-0' : 'shrink-0'">
        <Text size="sm" truncate class="tabular-nums" :lang="fact.lang">{{ fact.text }}</Text>
        <Text v-if="fact.accent" size="sm" weight="medium" class="shrink-0 text-accent-text">
          {{ fact.accent }}
        </Text>
      </Inline>
    </template>
  </Inline>
  <Text
    v-if="description"
    size="sm"
    class="hidden max-w-lg leading-relaxed text-fg/65 sm:line-clamp-2"
  >
    {{ description }}
  </Text>
  <Inline gap="sm" :wrap="false" data-actions class="pointer-events-auto self-start">
    <Button :as="NuxtLink" :to="work.to">查看详情</Button>
    <LandingGalgameHeroMark :galgame-id="item.id" />
  </Inline>
</template>

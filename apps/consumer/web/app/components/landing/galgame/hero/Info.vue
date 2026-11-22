<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Building2, MonitorSmartphone } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import { logoClass, stageLogo } from '~/features/galgame/logo'
  import { platformLabel, sortPlatforms } from '~/features/galgame/platforms'
  import { dayLabel, daysBetween, weekdayLabel } from '~/features/landing/labels'
  import { galgameWork } from '~/features/landing/works'
  import { cn } from '~/utils/cn'

  type Pick = ApiData<'/api/v3/landing/galgames', 'get'>['picks'][number]

  defineOptions({ name: 'LandingGalgameHeroInfo' })
  const props = defineProps<{ item: Pick; today: string }>()

  const work = computed(() => galgameWork(props.item))
  const date = computed(() => props.item.release_date?.slice(0, 10) ?? null)
  const countdown = computed(() => {
    if (!date.value) return null
    const days = daysBetween(props.today, date.value)
    if (days > 0) return { text: `还有 ${days} 天发售`, tone: 'accent' as const }
    if (days === 0) return { text: '今天发售', tone: 'accent' as const }
    return { text: `已发售 ${-days} 天`, tone: 'neutral' as const }
  })
  const shown = computed(() => stageLogo(props.item.logos, props.item.language))
  const logoRatio = computed(() => {
    const { width, height } = shown.value.logo?.media ?? {}
    return width && height ? width / height : undefined
  })
  const titleClass = computed(() =>
    cn(shown.value.light && 'sr-only', shown.value.dark ? 'dark:sr-only' : 'dark:not-sr-only'),
  )
  const platforms = computed(() =>
    sortPlatforms(props.item.platforms).map(platformLabel).join('、'),
  )
  const logoProcessing = { width: 960, quality: 90, fit: 'scale-down', format: 'auto' } as const
</script>

<template>
  <Stack gap="md" class="min-w-0">
    <Inline gap="sm" align="center" class="min-h-(--landing-line)">
      <Text v-if="date" size="sm" weight="semibold" class="tabular-nums">
        {{ dayLabel(date) }} {{ weekdayLabel(date) }}
      </Text>
      <Tag v-if="countdown" :tone="countdown.tone" pill>{{ countdown.text }}</Tag>
    </Inline>
    <Stack gap="none" justify="end" class="h-(--landing-title-height) min-w-0">
      <HikariImage
        v-if="shown.logo"
        :key="shown.logo.media.src"
        :src="shown.logo.media"
        alt=""
        :ratio="logoRatio"
        :processing="logoProcessing"
        :skeleton="false"
        :thumbhash="false"
        :class="cn('h-full max-w-full self-start', logoClass(shown.logo))"
        image-class="size-full object-contain object-bottom-left"
      />
      <Heading
        :level="3"
        :class="
          cn('line-clamp-2 text-3xl leading-tight font-bold tracking-tight lg:text-5xl', titleClass)
        "
      >
        {{ work.title }}
      </Heading>
    </Stack>
    <Inline gap="lg" align="center" :wrap="false" class="min-h-(--landing-line) min-w-0">
      <Inline v-if="work.sub" gap="xs" align="center" :wrap="false" class="shrink-0">
        <Building2 class="size-4 shrink-0 text-muted" />
        <Text size="sm" class="text-fg/90" lang="ja">{{ work.sub }}</Text>
      </Inline>
      <Inline v-if="platforms" gap="xs" align="center" :wrap="false" class="min-w-0">
        <MonitorSmartphone class="size-4 shrink-0 text-muted" />
        <Text size="sm" truncate class="text-fg/90">{{ platforms }}</Text>
      </Inline>
    </Inline>
    <Inline gap="sm" :wrap="false">
      <Button :as="NuxtLink" :to="work.to">查看详情</Button>
      <LandingGalgameHeroMark :key="item.id" :galgame-id="item.id" />
    </Inline>
  </Stack>
</template>

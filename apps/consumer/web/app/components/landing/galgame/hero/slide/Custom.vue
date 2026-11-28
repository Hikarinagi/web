<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { NuxtLink } from '#components'
  import wordmarkUrl from '~/assets/images/wordmark.svg'
  import { cn } from '~/utils/cn'

  type Slide = ApiData<'/api/v3/landing/galgames', 'get'>['slides'][number]

  defineOptions({ name: 'LandingGalgameHeroSlideCustom' })
  const props = defineProps<{ item: Slide }>()

  const logoRatio = computed(() => {
    const { width, height } = props.item.logo ?? {}
    return width && height ? width / height : undefined
  })
  const logoProcessing = { width: 960, quality: 90, fit: 'scale-down', format: 'auto' } as const
</script>

<template>
  <Stack gap="sm" class="min-w-0">
    <Inline
      v-if="item.partner === 'DLSITE'"
      gap="sm"
      align="center"
      :wrap="false"
      role="img"
      aria-label="Hikarinagi × DLsite"
    >
      <HikariImage
        :src="wordmarkUrl"
        alt=""
        :lazy="false"
        :skeleton="false"
        class="aspect-792/191 h-6 w-auto shrink-0 lg:h-8"
        image-class="object-contain"
      />
      <Text as="span" size="lg" tone="muted">×</Text>
      <DlsiteLogo class="h-4.5 lg:h-6" />
    </Inline>
    <HikariImage
      v-if="item.logo"
      :src="item.logo"
      alt=""
      :ratio="logoRatio"
      :processing="logoProcessing"
      :skeleton="false"
      :thumbhash="false"
      class="h-(--landing-logo-height) max-w-full self-start"
      image-class="size-full object-contain object-bottom-left"
    />
    <Heading
      v-if="item.title"
      :level="3"
      :class="
        cn(
          'line-clamp-2 text-2xl leading-tight font-semibold tracking-tight lg:text-4xl',
          item.logo && 'sr-only',
        )
      "
    >
      {{ item.title }}
    </Heading>
  </Stack>
  <Text
    v-if="item.description"
    size="sm"
    class="max-w-lg leading-relaxed text-fg/75 max-sm:line-clamp-3 sm:line-clamp-2"
  >
    {{ item.description }}
  </Text>
  <Stack v-if="item.link" gap="none" data-actions class="pointer-events-auto self-start">
    <Button
      :as="NuxtLink"
      :to="item.link"
      :target="item.open_in_new ? '_blank' : undefined"
      :rel="item.open_in_new ? 'noopener' : undefined"
    >
      {{ item.action_label || '了解详情' }}
    </Button>
  </Stack>
</template>

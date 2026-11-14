<script setup lang="ts">
  import { Heading, Inline, Link, Section, Stack, Text } from '@hina-ui/vue'
  import { ArrowLeft } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { useGalgameCover } from '~/features/galgame/useCoverVote'
  import { getGalgameBannerSource } from '~/utils/media/galgame'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'GalgameBand' })
  const props = defineProps<{
    galgame: GalgamePageData['galgame']
    title: string
    heading: string
  }>()

  const cover = useGalgameCover(() => props.galgame)
  const banner = computed(() => getGalgameBannerSource(props.galgame))
  const layout = computed(() => getCoverMediaLayout(cover.value))
</script>

<template>
  <Section class="relative isolate">
    <Stack gap="none" aria-hidden="true" class="absolute inset-0 -z-10 overflow-hidden">
      <HikariImage
        v-if="banner"
        :src="banner"
        alt=""
        :skeleton="false"
        :processing="{ width: 480, quality: 60, fit: 'cover', format: 'auto' }"
        class="absolute! inset-0 size-full scale-125 blur-3xl"
        image-class="object-cover"
      />
      <Stack gap="none" class="absolute inset-0 bg-(--hn-bg-canvas)/75" />
      <Stack
        gap="none"
        class="absolute inset-x-0 bottom-0 h-24 bg-linear-to-b from-transparent to-(--hn-bg-canvas)"
      />
    </Stack>
    <Inline
      gap="lg"
      align="end"
      :wrap="false"
      class="mx-auto w-full max-w-(--entry-container) px-4 pt-[calc(var(--app-header-height)+2rem)] pb-6 lg:px-6"
    >
      <HikariImage
        v-if="cover"
        :src="cover"
        :alt="`${title} 封面`"
        :ratio="layout.ratio"
        :processing="layout.processing"
        preload
        class="h-28 w-auto shrink-0 overflow-hidden rounded-md shadow-lg ring-1 ring-fg/10"
      />
      <Stack gap="xs" class="min-w-0">
        <Link
          :as="NuxtLink"
          :to="`/galgames/${galgame.id}`"
          tone="neutral"
          :underline="false"
          class="inline-flex w-fit max-w-full items-center gap-1.5 text-sm text-muted hover:text-fg"
        >
          <ArrowLeft class="size-3.5 shrink-0" />
          <Text as="span" size="sm" truncate class="text-inherit">{{ title }}</Text>
        </Link>
        <Heading :level="1" class="text-3xl leading-tight font-bold tracking-tight">
          {{ heading }}
        </Heading>
      </Stack>
    </Inline>
  </Section>
</template>

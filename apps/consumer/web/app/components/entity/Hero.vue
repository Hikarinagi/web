<script setup lang="ts">
  import { Card, Center, Heading, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import { Building2, UserRound } from '@lucide/vue'
  import { cn } from '~/utils/cn'
  import type { EntityDetail, EntityKind } from '~/features/entity/entity'
  import {
    cleanAliases,
    entityGender,
    entityHeroMeta,
    entityImage,
    entitySubName,
    entityTitle,
    heroTypeLabel,
  } from '~/features/entity/detail'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'EntityHero' })
  const props = defineProps<{ kind: EntityKind; entity: EntityDetail }>()

  const isLogo = computed(() => props.kind === 'producer')
  const title = computed(() => entityTitle(props.kind, props.entity))
  const sub = computed(() => entitySubName(props.kind, props.entity))
  const image = computed(() => entityImage(props.kind, props.entity))
  const hasImage = computed(() => Boolean(image.value?.src))
  const typeLabel = computed(() => heroTypeLabel(props.kind, props.entity))
  const gender = computed(() => (props.kind === 'character' ? entityGender(props.entity) : null))
  const meta = computed(() => entityHeroMeta(props.kind, props.entity))
  const aliases = computed(() => cleanAliases(props.entity.aliases))
  const coverLayout = computed(() => getCoverMediaLayout(image.value))
  const logoBox = computed(() => {
    const media = image.value
    const ratio = media?.width && media.height ? media.width / media.height : 3 / 2
    const maxH = 80
    const maxW = 240
    let h = maxH
    let w = maxH * ratio
    if (w > maxW) {
      w = maxW
      h = maxW / ratio
    }
    return { width: `${Math.round(w)}px`, height: `${Math.round(h)}px` }
  })
  const fallbackIcon = computed(() => (isLogo.value ? Building2 : UserRound))

  const bannerProcessing = {
    width: 1920,
    height: 720,
    fit: 'cover',
    quality: 72,
    blur: 40,
  } as const
</script>

<template>
  <Stack as="section" gap="none" class="relative isolate overflow-hidden border-b border-line">
    <template v-if="!isLogo && image?.src">
      <HikariImage
        :src="image"
        alt=""
        class="absolute inset-0 -z-20 h-full w-full"
        image-class="object-cover"
        :processing="bannerProcessing"
      />
      <Stack gap="none" class="absolute inset-0 -z-10 bg-canvas/80" />
    </template>
    <Stack
      gap="none"
      class="absolute inset-0 -z-10 bg-linear-to-r from-canvas via-canvas/78 to-accent/8"
    />

    <Inline
      gap="none"
      align="center"
      :wrap="false"
      :class="
        cn(
          'mx-auto w-full max-w-app flex-col justify-end gap-8 px-5 pt-[calc(var(--app-header-height)+2.25rem)] pb-12',
          'sm:px-6 sm:pt-[calc(var(--app-header-height)+3rem)]',
          'lg:flex-row lg:items-center lg:justify-start lg:gap-10 lg:py-14',
          hasImage
            ? 'min-h-[calc(500px+var(--app-header-height))] lg:min-h-[calc(520px+var(--app-header-height))]'
            : 'lg:pt-[calc(var(--app-header-height)+3.5rem)]',
        )
      "
    >
      <Stack
        v-if="!isLogo && hasImage"
        gap="none"
        class="mx-auto shrink-0"
        :style="{ width: coverLayout.width }"
      >
        <Card :padded="false" class="bg-veil p-2 shadow-lg">
          <HikariImage
            :src="image"
            :alt="title"
            class="rounded-md bg-subtle"
            :ratio="coverLayout.ratio"
            image-class="object-cover object-top"
            :processing="coverLayout.processing"
            :preload="{ fetchPriority: 'high' }"
            preview
          >
            <template #empty>
              <Center class="size-full text-faint">
                <component :is="fallbackIcon" :size="48" />
              </Center>
            </template>
            <template #error>
              <Center class="size-full text-faint">
                <component :is="fallbackIcon" :size="48" />
              </Center>
            </template>
          </HikariImage>
        </Card>
      </Stack>
      <Card
        v-else-if="hasImage"
        :padded="false"
        class="mx-auto flex shrink-0 items-center justify-center rounded-xl bg-veil p-2 shadow-lg"
      >
        <HikariImage
          :src="image"
          :alt="title"
          class="rounded-lg"
          :style="logoBox"
          image-class="object-contain"
          preset="large"
          preview
        >
          <template #empty>
            <Center class="size-full text-faint">
              <Building2 :size="44" />
            </Center>
          </template>
          <template #error>
            <Center class="size-full text-faint">
              <Building2 :size="44" />
            </Center>
          </template>
        </HikariImage>
      </Card>

      <Stack gap="lg" class="w-full min-w-0 flex-1 text-center lg:text-left">
        <Stack gap="sm">
          <Inline justify="center" gap="sm" class="lg:justify-start">
            <Tag v-if="typeLabel">{{ typeLabel }}</Tag>
            <Tag v-if="gender">{{ gender }}</Tag>
          </Inline>
          <Heading :level="1" size="2xl" class="leading-tight md:text-4xl lg:text-5xl">
            {{ title }}
          </Heading>
          <Text v-if="sub" size="lg" tone="muted" class="leading-7">{{ sub }}</Text>
        </Stack>

        <Inline v-if="aliases.shown.length" justify="center" gap="sm" class="lg:justify-start">
          <Tag v-for="alias in aliases.shown" :key="alias" size="sm">{{ alias }}</Tag>
          <Tag v-if="aliases.overflow" size="sm">+{{ aliases.overflow }}</Tag>
        </Inline>

        <Text v-if="meta" size="sm" tone="muted">{{ meta }}</Text>

        <Inline justify="center" align="stretch" gap="md" class="lg:justify-start">
          <ShareButton variant="outline" :tooltip="`分享${typeLabel}`" />
        </Inline>
      </Stack>
    </Inline>
  </Stack>
</template>

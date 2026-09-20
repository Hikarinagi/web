<script setup lang="ts">
  import { Building2, UserRound } from '@lucide/vue'
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
  const chipClass =
    'rounded-md bg-surface-100 px-2.5 py-1 text-xs font-medium text-surface-600 dark:bg-surface-800 dark:text-surface-300'
  const aliasClass =
    'rounded-md bg-surface-100/80 px-2 py-0.5 text-xs text-surface-600 dark:bg-surface-800/80 dark:text-surface-300'
</script>

<template>
  <section
    class="relative isolate overflow-hidden border-b border-surface-200 bg-surface-0 dark:border-surface-800 dark:bg-surface-950"
  >
    <template v-if="!isLogo && image?.src">
      <HikariImage
        :src="image.src"
        alt=""
        class="absolute inset-0 -z-20 h-full w-full"
        image-class="object-cover"
        :processing="bannerProcessing"
      />
      <div class="absolute inset-0 -z-10 bg-surface-0/80 dark:bg-surface-950/80" />
    </template>
    <div
      class="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--p-surface-0)_0%,rgba(255,255,255,0.78)_46%,rgba(57,197,187,0.08)_100%)] dark:bg-[linear-gradient(90deg,var(--p-surface-950)_0%,rgba(3,7,18,0.82)_46%,rgba(57,197,187,0.08)_100%)]"
    />

    <div
      class="mx-auto flex max-w-app flex-col justify-end gap-8 px-5 pt-[calc(var(--app-header-height)+2.25rem)] pb-12 sm:px-6 sm:pt-[calc(var(--app-header-height)+3rem)] lg:flex-row lg:items-center lg:justify-start lg:gap-10 lg:py-14"
      :class="
        hasImage
          ? 'min-h-[calc(500px+var(--app-header-height))] lg:min-h-[calc(520px+var(--app-header-height))]'
          : 'lg:pt-[calc(var(--app-header-height)+3.5rem)]'
      "
    >
      <div
        v-if="!isLogo && hasImage"
        class="mx-auto shrink-0"
        :style="{ width: coverLayout.width }"
      >
        <div
          class="rounded-lg border border-white/80 bg-white/70 p-2 shadow-[0_24px_80px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-surface-900/72 dark:shadow-black/40"
        >
          <HikariImage
            :src="image?.src"
            :alt="title"
            class="rounded-md bg-surface-950/5 dark:bg-surface-0/5"
            :style="{ aspectRatio: coverLayout.aspectRatio }"
            image-class="object-cover object-top"
            :processing="coverLayout.processing"
            :preload="{ fetchPriority: 'high' }"
            preview
          >
            <template #empty>
              <span class="flex size-full items-center justify-center text-surface-400">
                <component :is="fallbackIcon" :size="48" />
              </span>
            </template>
            <template #error>
              <span class="flex size-full items-center justify-center text-surface-400">
                <component :is="fallbackIcon" :size="48" />
              </span>
            </template>
          </HikariImage>
        </div>
      </div>
      <div
        v-else-if="hasImage"
        class="mx-auto flex shrink-0 items-center justify-center rounded-xl bg-surface-0/85 p-2 shadow-[0_18px_50px_rgba(15,23,42,0.10)] dark:bg-surface-900/72"
      >
        <HikariImage
          :src="image?.src"
          :alt="title"
          class="rounded-lg"
          :style="logoBox"
          image-class="object-contain"
          preset="large"
          preview
        >
          <template #empty>
            <span class="flex size-full items-center justify-center text-surface-400">
              <Building2 :size="44" />
            </span>
          </template>
          <template #error>
            <span class="flex size-full items-center justify-center text-surface-400">
              <Building2 :size="44" />
            </span>
          </template>
        </HikariImage>
      </div>

      <div class="w-full min-w-0 flex-1 space-y-6 text-center lg:text-left">
        <div class="space-y-3">
          <div class="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
            <span v-if="typeLabel" :class="chipClass">{{ typeLabel }}</span>
            <span v-if="gender" :class="chipClass">{{ gender }}</span>
          </div>
          <h1
            class="text-3xl leading-tight font-semibold text-surface-950 md:text-4xl lg:text-5xl dark:text-surface-0"
          >
            {{ title }}
          </h1>
          <p v-if="sub" class="text-lg leading-7 text-surface-600 dark:text-surface-300">
            {{ sub }}
          </p>
        </div>

        <div
          v-if="aliases.shown.length"
          class="flex flex-wrap items-center justify-center gap-2 lg:justify-start"
        >
          <span v-for="alias in aliases.shown" :key="alias" :class="aliasClass">{{ alias }}</span>
          <span v-if="aliases.overflow" :class="aliasClass">+{{ aliases.overflow }}</span>
        </div>

        <p v-if="meta" class="text-sm text-surface-600 dark:text-surface-300">{{ meta }}</p>

        <div class="flex flex-wrap items-stretch justify-center gap-3 lg:justify-start">
          <ShareButton severity="secondary" outlined :tooltip="`分享${typeLabel}`" />
        </div>
      </div>
    </div>
  </section>
</template>

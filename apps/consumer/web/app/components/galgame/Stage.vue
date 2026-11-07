<script setup lang="ts">
  import { Card, Heading, Inline, Link, Rating, Section, Stack, Text } from '@hina-ui/vue'
  import { CalendarDays, Languages, MonitorSmartphone } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { platformLabel } from '~/features/galgame/platforms'
  import { getGalgameCover } from '~/utils/media/galgame'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'GalgameStage' })
  const props = defineProps<{
    data: GalgamePageData
    title: string
    website?: string
    languages: string[]
  }>()
  const index = defineModel<number>('index', { required: true })
  defineEmits<{ gallery: [index: number]; cover: []; rate: [] }>()

  const images = computed(() => props.data.galgame.images.filter(image => image.src.trim()))
  const cover = computed(() => getGalgameCover(props.data.galgame))
  const layout = computed(() => getCoverMediaLayout(cover.value))
  const backdrop = computed(() => images.value[index.value] ?? cover.value)
  const brand = computed(() => props.data.display.brands[0] ?? null)
  const subtitle = computed(() => {
    const { display, galgame } = props.data
    if (display.original_title && display.original_title !== props.title)
      return { text: display.original_title, lang: 'ja' }
    return galgame.en_title ? { text: galgame.en_title, lang: 'en' } : null
  })
  const meta = computed(() => {
    const { display } = props.data
    return [
      { icon: CalendarDays, text: display.release?.text ?? '' },
      { icon: MonitorSmartphone, text: display.platforms.map(platformLabel).join('、') },
      { icon: Languages, text: props.languages.join('、') },
    ].filter(item => item.text)
  })
  const stats = computed(() => props.data.rate_stats)
  const backdropProcessing = {
    width: 1920,
    quality: 80,
    fit: 'scale-down',
    format: 'auto',
  } as const
  const thumbProcessing = { width: 240, quality: 72, fit: 'cover', format: 'auto' } as const
</script>

<template>
  <Section
    class="relative isolate overflow-hidden text-fg [--hn-bg-subtle:var(--stage-control)] lg:h-(--stage-height)"
  >
    <Stack
      gap="none"
      class="relative mt-(--app-header-height) aspect-21/9 mask-(--stage-fade) lg:absolute lg:inset-0 lg:-z-20 lg:mt-0 lg:aspect-auto"
    >
      <Transition
        enter-active-class="transition-opacity duration-700"
        enter-from-class="opacity-0"
        leave-active-class="absolute inset-0 transition-opacity duration-700"
        leave-to-class="opacity-0"
      >
        <HikariImage
          :key="backdrop?.src ?? 'none'"
          :src="backdrop"
          :alt="`${title} 的游戏画面`"
          :preload="{ fetchPriority: 'high' }"
          :processing="backdropProcessing"
          class="absolute inset-0 size-full"
          image-class="object-cover object-top"
        />
      </Transition>
      <Stack
        gap="none"
        class="pointer-events-none absolute inset-0 bg-linear-to-t from-(--stage-veil)/80 to-transparent to-50% lg:via-(--stage-veil)/60 lg:via-35% lg:to-70%"
      />
      <Stack
        gap="none"
        class="pointer-events-none absolute inset-y-0 left-0 hidden w-2/3 bg-linear-to-r from-(--stage-veil)/90 via-(--stage-veil)/45 via-45% to-transparent lg:flex"
      />
      <Stack
        gap="none"
        class="pointer-events-none absolute inset-x-0 top-0 hidden h-(--stage-top-shade) bg-linear-to-b from-(--stage-veil)/75 to-transparent lg:flex"
      />
    </Stack>

    <Stack
      gap="lg"
      :class="
        cn(
          'relative mx-auto -mt-8 w-full max-w-(--entry-container) px-4 pb-6 lg:mt-0 lg:h-full lg:justify-end lg:px-6 lg:pt-(--app-header-height)',
          !images.length && 'lg:pb-16',
        )
      "
    >
      <Inline align="end" justify="between" gap="xl" :wrap="false">
        <Stack gap="md" class="min-w-0 flex-1 lg:gap-5">
          <Stack gap="xs">
            <Link
              v-if="brand?.producer_id"
              :as="NuxtLink"
              :to="`/producers/${brand.producer_id}`"
              tone="neutral"
              class="self-start text-sm font-medium text-fg/80 lg:text-base"
              lang="ja"
            >
              {{ brand.text }}
            </Link>
            <Text v-else-if="brand" size="sm" weight="medium" class="text-fg/80" lang="ja">
              {{ brand.text }}
            </Text>
            <Heading
              :level="1"
              class="text-4xl leading-tight font-bold tracking-tight text-fg lg:text-6xl"
            >
              {{ title }}
            </Heading>
            <Text v-if="subtitle" tone="muted" class="text-base lg:text-xl" :lang="subtitle.lang">
              {{ subtitle.text }}
            </Text>
          </Stack>

          <Stack gap="xs" class="sm:flex-row sm:flex-wrap sm:gap-x-5">
            <Inline v-for="item in meta" :key="item.text" gap="sm" align="center" :wrap="false">
              <component :is="item.icon" class="size-4 shrink-0 text-muted" />
              <Text size="sm" class="text-fg/90">{{ item.text }}</Text>
            </Inline>
          </Stack>

          <Inline v-if="stats.average !== null" gap="md" align="center" :wrap="false">
            <Text class="text-5xl leading-none font-semibold tracking-tight text-fg tabular-nums">
              {{ stats.average.toFixed(1) }}
            </Text>
            <Stack gap="xs">
              <Rating
                :model-value="stats.average"
                :max="10"
                :stars="5"
                :step="0.5"
                readonly
                size="sm"
              />
              <Inline gap="md" :wrap="false">
                <Text size="sm" tone="muted" class="tabular-nums">
                  {{ stats.rated_count }} 人评分
                </Text>
                <Text size="sm" tone="muted" class="tabular-nums">
                  {{ stats.played_count }} 人玩过
                </Text>
              </Inline>
            </Stack>
          </Inline>

          <GalgameStageActions
            :galgame-id="data.galgame.id"
            :work-title="title"
            :my-rate="data.my_rate"
            :favorited="data.favorite?.favorited ?? false"
            :downloads="data.galgame.download_resource_count"
            :website="website"
            @rate="$emit('rate')"
          />
        </Stack>

        <Card
          v-if="cover"
          as="button"
          type="button"
          :padded="false"
          aria-label="查看封面"
          class="hidden shrink-0 cursor-zoom-in overflow-hidden rounded-lg border-0 shadow-2xl ring-1 ring-fg/15 lg:block"
          @click="$emit('cover')"
        >
          <HikariImage
            :src="cover"
            :alt="`${title} 封面`"
            :ratio="layout.ratio"
            :processing="layout.processing"
            preload
            class="w-(--stage-cover-width)"
          />
        </Card>
        <WorkCoverAdd
          v-else
          resource="galgame"
          :work-id="data.galgame.id"
          class="hidden shrink-0 lg:flex"
        />
      </Inline>

      <ScrollRail v-if="images.length" class="-mx-4 lg:-mx-1">
        <Inline gap="sm" align="center" :wrap="false" class="w-max px-4 py-1 lg:px-1">
          <Card
            v-for="(image, i) in images"
            :key="image.id"
            as="button"
            type="button"
            :padded="false"
            :aria-label="`第 ${i + 1} 张画面`"
            :aria-pressed="i === index"
            :class="
              cn(
                'shrink-0 overflow-hidden rounded-md border-0 shadow-none ring-2 ring-offset-2 ring-offset-(--stage-veil) transition',
                i === index ? 'ring-fg/80' : 'opacity-55 ring-transparent hover:opacity-100',
              )
            "
            @click="index = i"
          >
            <HikariImage
              :src="image"
              alt=""
              :ratio="16 / 9"
              :processing="thumbProcessing"
              class="w-(--stage-thumb-width)"
            />
          </Card>
          <Button
            variant="ghost"
            tone="neutral"
            size="sm"
            class="shrink-0"
            @click="$emit('gallery', index)"
          >
            查看全部 {{ images.length }} 张
          </Button>
        </Inline>
      </ScrollRail>
    </Stack>
  </Section>
</template>

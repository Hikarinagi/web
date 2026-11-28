<script setup lang="ts">
  import {
    Button as HnButton,
    Center,
    Heading,
    Inline,
    LineClamp,
    Link,
    Section,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ExternalLink, Star } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { LOGO_PROCESSING, logoRatio } from '~/features/org/logo'
  import { KIND_PATHS, workMonth, type OrgWork } from '~/features/org/works'
  import type { HikariImageSize } from '~/utils/media/image'

  defineOptions({ name: 'OrgHeader' })
  const props = defineProps<{
    producer: ProducerPageData['producer']
    newest: OrgWork | null
    score: number | null
    kind: string
    groups: { code: string; label: string; count: number }[]
  }>()
  defineEmits<{ group: [code: string] }>()

  const loaded = ref<HikariImageSize | null>(null)
  const ratio = computed(() => logoRatio(props.producer.logo, loaded.value))
  const { t } = useLocaleText()
  const intro = computed(() => props.producer.shown_intro)
</script>

<template>
  <Section class="border-b border-line bg-surface">
    <Stack
      gap="lg"
      class="mx-auto w-full max-w-(--entry-container) px-4 py-6 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8 lg:px-6"
    >
      <Center
        v-if="producer.logo"
        class="h-20 self-start overflow-hidden rounded-lg bg-white p-2 ring-1 ring-black/10 lg:h-24 lg:self-center"
        :style="{ aspectRatio: ratio }"
      >
        <HikariImage
          :src="producer.logo"
          :alt="t('entity.org.logo', { name: producer.name })"
          :processing="LOGO_PROCESSING"
          fit="contain"
          class="size-full"
          @load="size => (loaded = size)"
        />
      </Center>

      <Stack gap="sm" class="min-w-0">
        <Inline gap="md" align="center">
          <Heading :level="1" lang="ja" class="text-2xl leading-tight font-semibold lg:text-3xl">
            {{ producer.name }}
          </Heading>
          <Tag v-if="kind" size="sm">{{ kind }}</Tag>
        </Inline>
        <Inline gap="none" align="baseline" class="gap-x-5 gap-y-1">
          <Link
            v-for="group in groups"
            :key="group.code"
            as="button"
            type="button"
            tone="neutral"
            class="inline-flex items-baseline gap-1.5 text-sm"
            @click="$emit('group', group.code)"
          >
            <Text as="span" size="sm">{{ group.label }}</Text>
            <Text as="span" size="sm" weight="semibold" class="tabular-nums">
              {{ group.count }}
            </Text>
          </Link>
          <Inline v-if="newest" gap="xs" align="baseline" :wrap="false" class="min-w-0">
            <Text as="span" size="sm" tone="muted" class="shrink-0">
              {{ t('entity.org.newest') }}
            </Text>
            <Link
              :as="NuxtLink"
              :to="`/${KIND_PATHS[newest.kind]}/${newest.id}`"
              tone="neutral"
              class="truncate text-sm font-medium"
            >
              {{ newest.title }}
            </Link>
            <Text as="span" size="sm" tone="muted" class="shrink-0 tabular-nums">
              {{ workMonth(newest.date) }}
            </Text>
          </Inline>
          <Inline v-if="score" gap="xs" align="center" :wrap="false">
            <Text as="span" size="sm" tone="muted">{{ t('entity.org.average') }}</Text>
            <Star class="size-3.5 fill-current text-warning" />
            <Text as="span" size="sm" weight="semibold" class="tabular-nums">
              {{ score.toFixed(1) }}
            </Text>
          </Inline>
        </Inline>
        <LineClamp
          v-if="intro"
          :lines="2"
          :expand-label="t('common.expand')"
          :collapse-label="t('common.collapse')"
          class="max-w-3xl"
        >
          <Text
            size="sm"
            tone="muted"
            class="leading-relaxed whitespace-pre-line"
            :lang="intro.language ?? 'ja'"
            >{{ intro.text }}</Text
          >
        </LineClamp>
      </Stack>

      <Inline gap="sm" align="center" class="lg:justify-end lg:self-start">
        <HnButton
          v-if="producer.website"
          as="a"
          :href="producer.website"
          target="_blank"
          rel="noopener noreferrer"
          variant="soft"
          tone="neutral"
          size="sm"
        >
          <template #icon><ExternalLink /></template>
          {{ t('entity.org.website') }}
        </HnButton>
        <ShareButton :to="`/producers/${producer.id}`" :tooltip="t('common.share')" size="sm" />
      </Inline>
    </Stack>
  </Section>
</template>

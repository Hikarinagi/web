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
  import { KIND_PATHS, averageRating, today, workMonth, type OrgWork } from '~/features/org/works'

  defineOptions({ name: 'OrgHeader' })
  const props = defineProps<{
    producer: ProducerPageData['producer']
    works: OrgWork[]
    kind: string
    groups: { code: string; label: string; count: number }[]
  }>()
  defineEmits<{ group: [code: string] }>()

  const newest = computed(() => props.works.find(work => work.date && work.date <= today()))
  const score = computed(() => averageRating(props.works))
  const ratio = computed(() => {
    const logo = props.producer.logo
    return logo?.width && logo.height ? Math.min(Math.max(logo.width / logo.height, 1), 2.4) : 1
  })
  const intro = computed(() => props.producer.trans_intro || props.producer.intro)
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
          :alt="`${producer.name}的标志`"
          preset="thumbnail"
          class="size-full"
          image-class="object-contain"
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
            <Text as="span" size="sm" tone="muted" class="shrink-0">最新</Text>
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
            <Text as="span" size="sm" tone="muted">均分</Text>
            <Star class="size-3.5 fill-current text-warning" />
            <Text as="span" size="sm" weight="semibold" class="tabular-nums">
              {{ score.toFixed(1) }}
            </Text>
          </Inline>
        </Inline>
        <LineClamp
          v-if="intro"
          :lines="2"
          expand-label="展开"
          collapse-label="收起"
          class="max-w-3xl"
        >
          <Text size="sm" tone="muted" class="leading-relaxed whitespace-pre-line">{{
            intro
          }}</Text>
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
          官网
        </HnButton>
        <ShareButton :to="`/producers/${producer.id}`" tooltip="分享" size="sm" />
      </Inline>
    </Stack>
  </Section>
</template>

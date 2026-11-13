<script setup lang="ts">
  import { Button as HnButton, Center, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { ExternalLink, Gamepad2, Monitor } from '@lucide/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import {
    ageRatingLabel,
    channelLabel,
    titleText,
    versionKindLabel,
  } from '~/features/entry/labels'
  import { langLabel } from '~/features/galgame/labels'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameProductsRow' })
  const props = defineProps<{ product: GalgamePageData['products'][number] }>()
  defineEmits<{ select: [] }>()

  const PC = ['win', 'mac', 'lin']
  const icon = computed(() =>
    props.product.platforms.length && !props.product.platforms.some(code => PC.includes(code))
      ? Gamepad2
      : Monitor,
  )
  const details = computed(() =>
    [
      props.product.platforms.map(platformLabel).join('、'),
      props.product.release?.text ?? '发售日不详',
      props.product.languages.map(langLabel).join('、'),
      props.product.publishers.map(credit => credit.text).join('、'),
    ].filter(Boolean),
  )
  const stores = computed(() =>
    props.product.stores.flatMap(store =>
      store.url ? [{ ...store, label: channelLabel(store.channel), url: store.url }] : [],
    ),
  )
</script>

<template>
  <Inline
    gap="md"
    align="start"
    :wrap="false"
    class="relative px-4 py-3 transition-colors duration-(--hn-duration-fast) hover:bg-subtle"
  >
    <Center class="size-10 shrink-0 rounded-lg bg-subtle text-muted">
      <component :is="icon" class="size-5" />
    </Center>
    <Stack gap="xs" class="min-w-0 flex-1">
      <Inline gap="md" align="start" :wrap="false">
        <Inline gap="sm" align="center" class="min-w-0 flex-1">
          <Link
            as="button"
            type="button"
            tone="neutral"
            :underline="false"
            class="text-start font-medium after:absolute after:inset-0"
            lang="ja"
            @click="$emit('select')"
          >
            {{ titleText(product.title) }}
          </Link>
          <Tag v-if="product.kind" tone="accent">{{ versionKindLabel(product.kind) }}</Tag>
          <Tag v-if="product.collection" variant="outline" tone="neutral">合集</Tag>
          <Tag v-if="product.age_rating">{{ ageRatingLabel(product.age_rating) }}</Tag>
        </Inline>
        <Text v-if="product.price" weight="semibold" class="relative z-10 shrink-0 tabular-nums">
          {{ product.price.text }}
          <Text v-if="product.price.tax_included !== null" as="span" size="xs" tone="muted">
            {{ product.price.tax_included ? '含税' : '不含税' }}
          </Text>
        </Text>
      </Inline>
      <Inline gap="none" class="gap-x-3 tabular-nums">
        <Text v-for="part in details" :key="part" as="span" size="sm" tone="muted">{{ part }}</Text>
      </Inline>
      <Inline v-if="stores.length" gap="sm" class="relative z-10">
        <HnButton
          v-for="store in stores"
          :key="`${store.channel}-${store.code}`"
          as="a"
          :href="store.url"
          target="_blank"
          rel="noopener noreferrer"
          size="sm"
          variant="soft"
          tone="neutral"
        >
          {{ store.label }}
          <ExternalLink class="size-3.5 opacity-70" />
        </HnButton>
      </Inline>
    </Stack>
  </Inline>
</template>

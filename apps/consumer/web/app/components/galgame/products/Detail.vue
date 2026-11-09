<script setup lang="ts">
  import { Center, Inline, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { ageRatingLabel, releaseStatusLabel, versionKindLabel } from '~/features/entry/labels'
  import { getCoverMediaLayout } from '~/utils/media/layout'

  defineOptions({ name: 'GalgameProductsDetail' })
  const props = defineProps<{ product: ApiData<'/api/v3/products/{id}', 'get'> }>()

  const ratio = computed(() => getCoverMediaLayout(props.product.cover).ratio)
  const wide = computed(() => ratio.value > 1)
  const tags = computed(() => {
    const { kind, collection, age_rating, release_status } = props.product
    return [
      { label: versionKindLabel(kind), tone: 'accent' as const },
      { label: collection ? '合集' : null, tone: 'neutral' as const },
      { label: ageRatingLabel(age_rating), tone: 'neutral' as const },
      {
        label: release_status === 'RELEASED' ? null : releaseStatusLabel(release_status),
        tone: release_status === 'CANCELLED' ? ('danger' as const) : ('info' as const),
      },
    ].filter(tag => tag.label)
  })
  const released = computed(() =>
    props.product.release?.text ? `${props.product.release.text}发售` : '发售日不详',
  )
</script>

<template>
  <Stack gap="lg">
    <Center
      v-if="product.cover"
      :class="cn('overflow-hidden rounded-lg', !wide && 'bg-subtle py-6')"
    >
      <HikariImage
        :src="product.cover"
        :alt="product.title"
        :ratio="ratio"
        :processing="{ width: 960, quality: 86, fit: 'scale-down', format: 'auto' }"
        :class="wide ? 'w-full' : 'w-40 overflow-hidden rounded-md shadow-lg'"
        image-class="object-cover"
      />
    </Center>

    <Stack gap="sm">
      <Inline v-if="tags.length" gap="xs" align="center">
        <Tag v-for="tag in tags" :key="tag.label ?? ''" :tone="tag.tone">{{ tag.label }}</Tag>
      </Inline>
      <Inline gap="md" align="baseline" justify="between">
        <Text v-if="product.price" class="text-2xl font-semibold tabular-nums">
          {{ product.price.text }}
          <Text v-if="product.price.tax_included !== null" as="span" size="xs" tone="muted">
            {{ product.price.tax_included ? '含税' : '不含税' }}
          </Text>
        </Text>
        <Text size="sm" tone="muted" class="tabular-nums">{{ released }}</Text>
      </Inline>
      <GalgameProductsStores :stores="product.stores" />
    </Stack>

    <GalgameProductsFacts :product="product" />
    <GalgameProductsCredits v-if="product.credits.length" :credits="product.credits" />
  </Stack>
</template>

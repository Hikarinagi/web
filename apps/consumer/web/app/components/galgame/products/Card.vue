<script setup lang="ts">
  import {
    Card,
    DescriptionDetails,
    DescriptionList,
    DescriptionTerm,
    Inline,
    Ripple,
    Stack,
    Tag,
    Text,
  } from '@hina-ui/vue'
  import { ChevronRight } from '@lucide/vue'
  import type { BackendProductSummary } from '~/features/entry/contract'
  import { ageRatingLabel, versionKindLabel, titleText } from '~/features/entry/labels'
  import { platformLabel } from '~/features/galgame/platforms'

  defineOptions({ name: 'GalgameProductsCard' })
  defineProps<{ product: BackendProductSummary }>()
  defineEmits<{ select: [] }>()
</script>

<template>
  <Card
    as="button"
    type="button"
    class="hn-state-layer flex hn-interactive items-start gap-3 text-start hn-press-lg"
    @click="$emit('select')"
  >
    <Ripple />
    <Stack gap="sm" class="min-w-0 flex-1">
      <Inline v-if="product.kind || product.collection" gap="xs" align="center">
        <Tag v-if="product.kind" tone="neutral">{{ versionKindLabel(product.kind) }}</Tag>
        <Tag v-if="product.collection" variant="outline" tone="neutral">合集</Tag>
      </Inline>
      <Text size="sm" weight="medium">{{ titleText(product.title) }}</Text>
      <DescriptionList orientation="horizontal" class="text-xs">
        <DescriptionTerm>平台</DescriptionTerm>
        <DescriptionDetails>
          {{ product.platforms.map(platformLabel).join('、') || '—' }}
        </DescriptionDetails>
        <DescriptionTerm>发售日</DescriptionTerm>
        <DescriptionDetails>{{ product.release?.text ?? '—' }}</DescriptionDetails>
        <DescriptionTerm>价格</DescriptionTerm>
        <DescriptionDetails>
          <template v-if="product.price">
            {{ product.price.text }}
            <template v-if="product.price.tax_included !== null">
              {{ product.price.tax_included ? '含税' : '不含税' }}
            </template>
          </template>
          <template v-else>—</template>
        </DescriptionDetails>
        <DescriptionTerm>年龄分级</DescriptionTerm>
        <DescriptionDetails>{{ ageRatingLabel(product.age_rating) ?? '—' }}</DescriptionDetails>
      </DescriptionList>
    </Stack>
    <ChevronRight class="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
  </Card>
</template>

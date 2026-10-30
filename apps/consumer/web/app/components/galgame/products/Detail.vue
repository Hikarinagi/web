<script setup lang="ts">
  import { Heading, Inline, Link, Stack, Tag, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { versionKindLabel, titleText } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsDetail' })
  defineProps<{ product: ApiData<'/api/v3/products/{id}', 'get'> }>()
</script>

<template>
  <Stack gap="lg">
    <Inline gap="md" align="start" :wrap="false">
      <HikariImage
        v-if="product.cover"
        :src="product.cover"
        :alt="product.title"
        class="w-24 shrink-0 rounded-md md:w-36"
        image-class="object-cover"
      />
      <Stack gap="sm" class="min-w-0">
        <Tag v-if="product.kind" tone="neutral" class="self-start">
          {{ versionKindLabel(product.kind) }}
        </Tag>
        <Heading :level="3" size="lg">{{ titleText(product.title) }}</Heading>
        <Text size="sm" tone="muted">
          收录的游戏：
          <template v-for="(game, index) in product.games" :key="game.id">
            <Text v-if="index" as="span">、</Text>
            <Link :as="NuxtLink" :to="`/galgames/${game.id}`" tone="accent">{{ game.title }}</Link>
          </template>
        </Text>
      </Stack>
    </Inline>
    <GalgameProductsFacts :product="product" />
    <GalgameProductsCredits v-if="product.credits.length" :credits="product.credits" />
    <GalgameProductsStores :product="product" />
  </Stack>
</template>

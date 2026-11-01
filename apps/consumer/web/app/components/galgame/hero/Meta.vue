<script setup lang="ts">
  import { Inline, Link, Tag, Text } from '@hina-ui/vue'
  import { Building2, CalendarDays } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { BackendGameDisplay } from '~/features/entry/contract'

  defineProps<{ display: BackendGameDisplay }>()
</script>

<template>
  <Inline gap="none" align="center" wrap class="justify-center gap-x-6 gap-y-3 lg:justify-start">
    <Text
      v-if="display.release"
      as="span"
      size="sm"
      tone="muted"
      class="inline-flex items-center gap-2"
    >
      <CalendarDays class="size-4 shrink-0" aria-hidden="true" />
      {{ display.release.text ?? '未定' }}
      <Tag v-if="display.release.planned" tone="info">预定</Tag>
    </Text>
    <Text
      v-if="display.brands.length"
      as="span"
      size="sm"
      tone="muted"
      class="inline-flex items-center gap-2"
    >
      <Building2 class="size-4 shrink-0" aria-hidden="true" />
      <template v-for="(brand, index) in display.brands" :key="`${brand.text}-${index}`">
        <Text v-if="index" as="span" aria-hidden="true">、</Text>
        <Link
          v-if="brand.producer_id"
          :as="NuxtLink"
          :to="`/producers/${brand.producer_id}`"
          tone="accent"
        >
          {{ brand.text }}
        </Link>
        <Text v-else as="span">{{ brand.text }}</Text>
      </template>
    </Text>
  </Inline>
</template>

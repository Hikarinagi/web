<script setup lang="ts">
  import { Button, Heading, Inline, Stack, Tag } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { channelLabel } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsStores' })
  const props = defineProps<{ product: ApiData<'/api/v3/products/{id}', 'get'> }>()

  const stores = computed(() =>
    props.product.stores.map(store => ({ ...store, label: channelLabel(store.channel) })),
  )
</script>

<template>
  <Stack v-if="stores.length" gap="sm" class="border-t border-line pt-5">
    <Heading :level="4" size="sm">商店</Heading>
    <Inline gap="sm" wrap>
      <template v-for="store in stores" :key="`${store.label}-${store.code}`">
        <Button
          v-if="store.url"
          as="a"
          :href="store.url"
          target="_blank"
          rel="noopener noreferrer"
          variant="outline"
          tone="neutral"
          size="sm"
        >
          <template #icon><ExternalLink /></template>
          {{ store.label }}
        </Button>
        <Tag v-else variant="outline" tone="neutral" size="md"
          >{{ store.label }} {{ store.code }}</Tag
        >
      </template>
    </Inline>
  </Stack>
</template>

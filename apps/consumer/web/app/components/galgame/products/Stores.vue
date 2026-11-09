<script setup lang="ts">
  import { Button, Inline, Tag } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { channelLabel } from '~/features/entry/labels'

  defineOptions({ name: 'GalgameProductsStores' })
  const props = defineProps<{ stores: ApiData<'/api/v3/products/{id}', 'get'>['stores'] }>()

  const items = computed(() =>
    props.stores.map(store => ({ ...store, label: channelLabel(store.channel) })),
  )
</script>

<template>
  <Inline v-if="items.length" gap="sm">
    <template v-for="store in items" :key="`${store.label}-${store.code}`">
      <Button
        v-if="store.url"
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
      </Button>
      <Tag v-else variant="outline" tone="neutral">{{ store.label }} {{ store.code }}</Tag>
    </template>
  </Inline>
</template>

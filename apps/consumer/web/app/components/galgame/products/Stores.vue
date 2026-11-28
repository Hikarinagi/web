<script setup lang="ts">
  import { Button, Inline, Tag } from '@hina-ui/vue'
  import { ExternalLink } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { channelLabel } from '~/features/entry/labels'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameProductsStores' })
  const props = defineProps<{
    stores: ApiData<'/api/v3/products/{id}', 'get'>['stores']
    dlsite: GalgamePageData['dlsite']
  }>()

  const items = computed(() =>
    props.stores.map(store => {
      const code = store.code.trim().toUpperCase()
      const sponsored =
        store.channel === 'DLSITE'
          ? props.dlsite?.links.find(link => link.code === code)?.url
          : undefined
      return {
        ...store,
        label: channelLabel(store.channel),
        url: sponsored ?? store.url,
        rel: sponsored ? 'sponsored noopener' : 'noopener noreferrer',
      }
    }),
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
        :rel="store.rel"
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

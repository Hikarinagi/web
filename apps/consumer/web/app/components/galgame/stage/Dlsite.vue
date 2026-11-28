<script setup lang="ts">
  import { Badge, Button } from '@hina-ui/vue'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'

  defineOptions({ name: 'GalgameStageDlsite' })
  const props = defineProps<{ dlsite: NonNullable<GalgamePageData['dlsite']> }>()

  const link = computed(() => props.dlsite.links[0])
</script>

<template>
  <Badge v-if="link" :content="dlsite.badge" size="md">
    <Button
      as="a"
      :href="link.url"
      target="_blank"
      rel="sponsored noopener"
      variant="soft"
      tone="neutral"
      data-track="dlsite_click"
    >
      <LocaleMessage keypath="galgame.dlsite.buy">
        <template #logo><DlsiteLogo class="h-3.5! w-auto!" /></template>
      </LocaleMessage>
    </Button>
  </Badge>
</template>

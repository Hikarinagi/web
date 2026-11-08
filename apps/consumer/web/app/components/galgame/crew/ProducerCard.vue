<script setup lang="ts">
  import { Card, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import type { GalgamePageData } from '~~/server/api/pages/galgames/[id].get'
  import { producerRoleLabel } from '~/features/galgame/labels'

  defineOptions({ name: 'GalgameCrewProducerCard' })
  const props = defineProps<{ item: GalgamePageData['producers'][number] }>()

  const roleText = computed(() => producerRoleLabel(props.item.role) || '厂商')
</script>

<template>
  <Card
    :as="NuxtLink"
    :to="`/producers/${item.producer.id}`"
    :padded="false"
    class="hn-state-layer hn-interactive rounded-xl px-5 py-4 hn-press-lg"
  >
    <Ripple />

    <Stack gap="none" class="gap-1">
      <Text as="p" size="base" weight="semibold" class="font-bold wrap-anywhere">
        {{ item.producer.name }}
        <Text v-if="item.note" as="span" size="sm" tone="faint" class="font-normal">
          ({{ item.note }})
        </Text>
      </Text>
      <Text as="p" size="xs" tone="muted">{{ roleText }}</Text>
    </Stack>
  </Card>
</template>

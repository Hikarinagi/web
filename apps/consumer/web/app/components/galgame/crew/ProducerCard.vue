<script setup lang="ts">
  import { Card, Ripple, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'

  defineOptions({ name: 'GalgameCrewProducerCard' })
  defineProps<{ name: string; producerId: number | null; roles: string }>()
</script>

<template>
  <Card
    v-if="producerId"
    :as="NuxtLink"
    :to="`/producers/${producerId}`"
    :padded="false"
    class="hn-state-layer hn-interactive rounded-xl px-5 py-4 hn-press-lg"
  >
    <Ripple />
    <Stack gap="none" class="gap-1">
      <Text as="p" weight="semibold" class="font-bold wrap-anywhere">{{ name }}</Text>
      <Text v-if="roles" as="p" size="xs" tone="muted">{{ roles }}</Text>
    </Stack>
  </Card>
  <Card v-else :padded="false" class="rounded-xl px-5 py-4">
    <Stack gap="none" class="gap-1">
      <Text as="p" weight="semibold" class="font-bold wrap-anywhere">{{ name }}</Text>
      <Text v-if="roles" as="p" size="xs" tone="muted">{{ roles }}</Text>
    </Stack>
  </Card>
</template>

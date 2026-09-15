<script setup lang="ts">
  import { Card, Center, Grid, Stack, Tag, Text } from '@hina-ui/vue'
  import type { ProducerPageData } from '~~/server/api/pages/producers/[id].get'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { producerRelationLabel } from '~/features/entity/labels'

  defineOptions({ name: 'EntityProducerRelations' })
  const props = defineProps<{ relations: ProducerPageData['relations'] }>()
  const items = computed(() => props.relations ?? [])
</script>

<template>
  <EntitySection v-if="items.length" title="关联公司" :meta="`${items.length}`">
    <Grid :cols="1" class="gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <Card
        v-for="r in items"
        :key="`${r.relation}-${r.target_producer.id}`"
        as-child
        :padded="false"
        class="hn-state-layer flex hn-interactive items-center gap-3 rounded-xl p-3 hn-press-none"
      >
        <NuxtLink :to="`/producers/${r.target_producer.id}`">
          <Center class="size-12 shrink-0 overflow-hidden rounded-lg bg-subtle">
            <HikariImage
              :src="r.target_producer.logo?.src"
              :alt="r.target_producer.name"
              class="size-full"
              image-class="object-contain"
              :skeleton="false"
              :fallback-src="ENTITY_FALLBACK_IMAGE"
            />
          </Center>
          <Stack gap="none" class="min-w-0 flex-1">
            <Text size="sm" weight="medium" truncate>{{ r.target_producer.name }}</Text>
            <Tag class="mt-1 w-fit">{{ producerRelationLabel(r.relation) }}</Tag>
          </Stack>
        </NuxtLink>
      </Card>
    </Grid>
  </EntitySection>
</template>

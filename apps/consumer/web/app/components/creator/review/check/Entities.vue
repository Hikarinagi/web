<script setup lang="ts">
  import { Card, Heading, Inline, Link, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import { NuxtLink } from '#components'
  import { Layers } from '@lucide/vue'
  import { checkFieldLabel, entityKind, type BackendCheckEntity } from '~/features/creator/check'

  const props = defineProps<{ entities: BackendCheckEntity[]; selectable: boolean }>()
  const choices = defineModel<Record<number, 'existing' | 'new'>>('choices', { required: true })

  const options = (entity: BackendCheckEntity) => [
    { label: `改用 #${entity.existing_id}`, value: 'existing' },
    { label: '保留新建', value: 'new' },
  ]
  const choosable = (entity: BackendCheckEntity) =>
    props.selectable && entity.verified && entity.existing_id != null
  const found = (entity: BackendCheckEntity) =>
    (entity.values ?? [])
      .filter(field => field.verified)
      .map(field => `${checkFieldLabel(field.field, entity.resource_type)} ${field.display}`)
      .join(' · ')

  function choose(entity: BackendCheckEntity, value: string | number | undefined) {
    if (value === 'existing' || value === 'new') {
      choices.value = { ...choices.value, [entity.change_request_id]: value }
    }
  }
</script>

<template>
  <Stack v-if="entities.length" gap="xs">
    <Heading :level="3" size="sm">同批新建</Heading>
    <Card v-for="entity in entities" :key="entity.change_request_id">
      <Stack gap="sm" class="md:flex-row md:items-center">
        <Inline gap="sm" align="start" :wrap="false" class="min-w-0 flex-1">
          <Layers class="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
          <Stack gap="none" class="min-w-0">
            <Text size="sm" weight="medium">
              {{ entityKind(entity) }}「{{ entity.name }}」 ·
              <Link :as="NuxtLink" :to="`/create/contributions/${entity.change_request_id}`">
                #{{ entity.change_request_id }}
              </Link>
            </Text>
            <Text v-if="entity.reason" size="sm" tone="muted">{{ entity.reason }}</Text>
            <Text v-else-if="entity.resolved_by === 'program'" size="sm" tone="muted">
              已通过外部编号匹配
            </Text>
            <Text v-if="found(entity)" size="sm" tone="muted">
              核对找到的原名与编号：{{ found(entity) }}
            </Text>
          </Stack>
        </Inline>
        <SegmentedControl
          v-if="choosable(entity)"
          size="sm"
          :options="options(entity)"
          :model-value="choices[entity.change_request_id] ?? 'new'"
          :aria-label="`${entityKind(entity)}「${entity.name}」`"
          @update:model-value="choose(entity, $event)"
        />
      </Stack>
    </Card>
  </Stack>
</template>

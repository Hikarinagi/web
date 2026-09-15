<script setup lang="ts">
  import { Center, Inline, Stack, Text } from '@hina-ui/vue'
  import { RESOURCE_TYPE_ICON } from '~/features/creator/labels'
  import type { PickedEntity } from '~/components/hikari-editor/plugins/entity-card/search'
  import { composerWorkType } from './types'

  defineOptions({ name: 'FeedComposerRelatedWorksRow' })

  const props = defineProps<{ entity: PickedEntity }>()

  const icon = computed(() => RESOURCE_TYPE_ICON[composerWorkType(props.entity)])
</script>

<template>
  <Inline as="span" :wrap="false" gap="sm" align="center" class="min-w-0">
    <HikariImage
      :src="entity.display.cover"
      :alt="entity.display.title"
      :nsfw="entity.display.nsfw"
      preset="small"
      class="size-10 shrink-0 overflow-hidden rounded-sm bg-inset"
      image-class="size-full object-cover"
    >
      <template #empty>
        <Center class="size-full text-muted"><component :is="icon" /></Center>
      </template>
      <template #error>
        <Center class="size-full text-muted"><component :is="icon" /></Center>
      </template>
    </HikariImage>

    <Stack as="span" gap="none" class="min-w-0 flex-1">
      <Text as="span" truncate>{{ entity.display.title }}</Text>
      <Text v-if="entity.display.subtitle" as="span" size="xs" tone="muted" truncate>
        {{ entity.display.subtitle }}
      </Text>
      <Text v-else-if="entity.display.meta" as="span" size="xs" tone="muted" truncate>
        {{ entity.display.meta }}
      </Text>
    </Stack>
  </Inline>
</template>

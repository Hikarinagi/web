<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'

  defineOptions({ name: 'HikariContentNodesEntityCardCharacter' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.character_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.characters.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('character', summary.value.id) : null))
  const name = computed(() => summary.value?.name ?? '未知角色')
  const image = computed(() => summary.value?.image?.src ?? null)
</script>

<template>
  <HikariContentNodesEntityCardContainer
    :id="id"
    type="character"
    id-attr="data-character-id"
    :href="href"
  >
    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
      <HikariImage
        :src="image"
        :alt="name"
        preset="small"
        class="size-16 flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover object-top"
        :fallback-src="ENTITY_FALLBACK_IMAGE"
      />
      <Stack gap="none" class="min-w-0 flex-1 gap-0.5">
        <Text as="span" weight="semibold" truncate class="text-(--editor-text-color)">
          {{ name }}
        </Text>
        <Text as="span" size="xs" class="text-(--editor-text-muted)">角色</Text>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>

<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'

  defineOptions({ name: 'HikariContentNodesEntityCardProducer' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.producer_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.producers.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('producer', summary.value.id) : null))
  const name = computed(() => summary.value?.name ?? '未知厂商')
  const logo = computed(() => summary.value?.logo?.src ?? null)
</script>

<template>
  <HikariContentNodesEntityCardContainer
    :id="id"
    type="producer"
    id-attr="data-producer-id"
    :href="href"
  >
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="logo"
        :alt="name"
        preset="small"
        class="size-16 flex-none rounded-md bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-contain p-2"
        :fallback-src="ENTITY_FALLBACK_IMAGE"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span class="truncate text-base font-semibold text-(--editor-text-color)">{{ name }}</span>
        <span class="text-[11px] text-(--editor-text-muted)">厂商</span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>

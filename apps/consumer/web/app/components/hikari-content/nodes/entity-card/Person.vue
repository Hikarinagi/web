<script setup lang="ts">
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { ENTITY_FALLBACK_IMAGE } from '~/features/entity/entity'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'

  defineOptions({ name: 'HikariContentNodesEntityCardPerson' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.person_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.persons.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('person', summary.value.id) : null))
  const name = computed(() => summary.value?.name ?? '未知人物')
  const image = computed(() => summary.value?.image?.src ?? null)
</script>

<template>
  <HikariContentNodesEntityCardContainer
    :id="id"
    type="person"
    id-attr="data-person-id"
    :href="href"
  >
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="image"
        :alt="name"
        preset="avatar"
        class="size-16 flex-none overflow-hidden rounded-full bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover"
        :fallback-src="ENTITY_FALLBACK_IMAGE"
      />
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span class="truncate text-base font-semibold text-(--editor-text-color)">{{ name }}</span>
        <span class="text-[11px] text-(--editor-text-muted)">人物</span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>

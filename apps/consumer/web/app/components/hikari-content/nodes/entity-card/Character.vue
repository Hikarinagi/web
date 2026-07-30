<script setup lang="ts">
  import { UserSquare } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
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
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="image"
        :alt="name"
        preset="small"
        class="size-16 flex-none overflow-hidden rounded-md bg-(--editor-toolbar-item-hover)"
        image-class="size-full object-cover object-top"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="UserSquare" :size="28" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="UserSquare" :size="28" />
        </template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span class="truncate text-[15px] font-semibold text-(--editor-text-color)">
          {{ name }}
        </span>
        <span class="text-[11px] text-(--editor-text-muted)">角色</span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>

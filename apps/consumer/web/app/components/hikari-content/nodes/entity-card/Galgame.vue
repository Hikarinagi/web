<script setup lang="ts">
  import { Inline, Stack, Text } from '@hina-ui/vue'
  import { GamepadDirectional } from '@lucide/vue'
  import type { EditorNode } from '@hikarinagi/editor-schema'
  import { useContentSummaries } from '../../composables/useContentSummaries'
  import { entityHref } from './links'
  import { joinMeta, yearOf } from './format'

  defineOptions({ name: 'HikariContentNodesEntityCardGalgame' })

  const props = defineProps<{ node: EditorNode }>()
  const summaries = useContentSummaries()

  const id = computed(() => {
    const v = props.node.attrs?.galgame_id
    return typeof v === 'number' && v > 0 ? v : null
  })
  const summary = computed(() =>
    id.value !== null ? (summaries.value.galgames.get(id.value) ?? null) : null,
  )
  const href = computed(() => (summary.value ? entityHref('galgame', summary.value.id) : null))
  const title = computed(
    () => summary.value?.trans_title || summary.value?.origin_title || '未命名作品',
  )
  const subtitle = computed(() => {
    const origin = summary.value?.origin_title
    return summary.value?.trans_title && origin && origin !== summary.value.trans_title
      ? origin
      : null
  })
  const meta = computed(() =>
    joinMeta(['Galgame', yearOf(summary.value?.release_date), summary.value?.top_producer_name]),
  )
  const cover = computed(() => summary.value?.top_cover ?? null)
  const hasBackdrop = computed(() => !!cover.value)
  const nsfw = computed(() => summary.value?.nsfw ?? false)
  const { shouldBlockNsfw } = useNsfwPolicy()
  const blocked = computed(() => shouldBlockNsfw(nsfw.value))
</script>

<template>
  <HikariContentNodesEntityCardContainer
    v-if="!blocked"
    :id="id"
    type="galgame"
    id-attr="data-galgame-id"
    :href="href"
  >
    <HikariContentNodesEntityCardBackdrop v-if="hasBackdrop" :src="cover ?? undefined" />

    <Inline gap="none" align="center" :wrap="false" class="relative z-1 gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-24 w-24 flex-none overflow-hidden rounded-lg bg-(--editor-toolbar-item-hover) shadow-hikari-cover-xs"
        image-class="size-full object-cover"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="GamepadDirectional" :size="28" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="GamepadDirectional" :size="28" />
        </template>
      </HikariImage>
      <Stack gap="xs" class="min-w-0 flex-1">
        <Text
          as="span"
          size="md"
          truncate
          class="font-bold"
          :class="
            hasBackdrop ? 'text-white text-shadow-hikari-on-image' : 'text-(--editor-text-color)'
          "
        >
          {{ title }}
        </Text>
        <Text
          v-if="subtitle"
          as="span"
          size="sm"
          truncate
          :class="
            hasBackdrop ? 'text-white/78 text-shadow-hikari-on-image' : 'text-(--editor-text-muted)'
          "
        >
          {{ subtitle }}
        </Text>
        <Text
          v-if="meta"
          as="span"
          size="xs"
          class="tracking-wide"
          :class="
            hasBackdrop ? 'text-white/65 text-shadow-hikari-on-image' : 'text-(--editor-text-muted)'
          "
        >
          {{ meta }}
        </Text>
      </Stack>
    </Inline>
  </HikariContentNodesEntityCardContainer>
</template>

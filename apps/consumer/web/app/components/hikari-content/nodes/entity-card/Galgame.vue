<script setup lang="ts">
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
    joinMeta(['Galgame', yearOf(summary.value?.start_date), summary.value?.top_producer_name]),
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
    <div v-if="hasBackdrop" class="pointer-events-none absolute inset-0 z-0">
      <HikariImage
        :src="cover"
        alt=""
        :processing="{ blur: 60, brightness: 0.5, width: 600, quality: 75 }"
        :skeleton="false"
        class="size-full"
        image-class="size-full object-cover scale-110"
      >
        <template #empty><span /></template>
        <template #error><span /></template>
      </HikariImage>
      <span
        class="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.35)_0%,rgb(0_0_0/0.55)_40%,rgb(0_0_0/0.65)_100%)]"
        aria-hidden="true"
      />
    </div>
    <div class="relative z-1 flex items-center gap-3.5">
      <HikariImage
        :src="cover"
        :alt="title"
        preset="small"
        class="h-24 w-24 flex-none overflow-hidden rounded-lg bg-(--editor-toolbar-item-hover) shadow-[0_6px_16px_rgb(0_0_0/0.35)]"
        image-class="size-full object-cover"
      >
        <template #empty>
          <HikariContentNodesEntityCardCoverFallback :icon="GamepadDirectional" :size="28" />
        </template>
        <template #error>
          <HikariContentNodesEntityCardCoverFallback :icon="GamepadDirectional" :size="28" />
        </template>
      </HikariImage>
      <div class="flex min-w-0 flex-1 flex-col gap-1">
        <span
          :class="[
            'truncate text-[17px] font-bold tracking-[-0.01em]',
            hasBackdrop
              ? 'text-white [text-shadow:0_1px_6px_rgb(0_0_0/0.5)]'
              : 'text-(--editor-text-color)',
          ]"
        >
          {{ title }}
        </span>
        <span
          v-if="subtitle"
          :class="[
            'truncate text-[13px]',
            hasBackdrop
              ? 'text-white/78 [text-shadow:0_1px_4px_rgb(0_0_0/0.45)]'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ subtitle }}
        </span>
        <span
          v-if="meta"
          :class="[
            'text-[11px] tracking-[0.02em]',
            hasBackdrop
              ? 'text-white/65 [text-shadow:0_1px_3px_rgb(0_0_0/0.4)]'
              : 'text-(--editor-text-muted)',
          ]"
        >
          {{ meta }}
        </span>
      </div>
    </div>
  </HikariContentNodesEntityCardContainer>
</template>

<script setup lang="ts">
  import { Kbd, Progress, Stack, Text, Toolbar, ToolbarButton } from '@hina-ui/vue'
  import { ArrowLeft, Bookmark, Type } from '@lucide/vue'
  import { NuxtLink } from '#components'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderDesktopFocus' })

  defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { shell, location, bookmarks, engine } = useReader()
  const { title, current, laid, position } = location
  const { marked } = bookmarks
  const zone = useTemplateRef('zone')
  const hovered = useElementHover(() => zone.value?.$el as HTMLElement | undefined, {
    delayLeave: 1000,
  })

  const percent = computed(() =>
    laid.value && position.value ? Math.floor(position.value.progress * 100) : null,
  )
</script>

<template>
  <Stack ref="zone" gap="none" align="center" class="absolute inset-x-0 top-0 z-20 min-h-6">
    <Progress :value="percent ?? 0" size="sm" aria-label="全书进度" class="w-full rounded-none" />
    <Transition
      enter-active-class="hn-transition ease-(--hn-ease-enter)"
      leave-active-class="hn-transition ease-(--hn-ease-exit)"
      enter-from-class="-translate-y-2 opacity-0"
      leave-to-class="-translate-y-2 opacity-0"
    >
      <Toolbar
        v-if="hovered"
        label="专注模式工具条"
        size="sm"
        class="mt-3 max-w-[calc(100%-(--spacing(8)))] rounded-full shadow-lg"
      >
        <ToolbarButton
          label="返回分卷详情"
          :as="NuxtLink"
          :to="`/light-novel-volumes/${data.volume.id}`"
        >
          <ArrowLeft aria-hidden="true" />
        </ToolbarButton>
        <Text size="sm" truncate class="min-w-0 px-1">{{ title || current?.label }}</Text>
        <Text v-if="percent !== null" size="sm" tone="muted" class="shrink-0 px-1 tabular-nums">
          全书 {{ percent }}%
        </Text>
        <ToolbarButton
          :label="marked ? '移除书签' : '添加书签'"
          :aria-pressed="marked"
          :disabled="engine.phase.value !== 'ready'"
          @click="bookmarks.toggle()"
        >
          <Bookmark :fill="marked ? 'currentColor' : 'none'" aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton label="阅读设置" @click="shell.togglePanel('settings')">
          <Type aria-hidden="true" />
        </ToolbarButton>
        <ToolbarButton variant="soft" class="shrink-0" @click="shell.toggleFocus()">
          退出专注模式
          <template #trailing><Kbd>F</Kbd></template>
        </ToolbarButton>
      </Toolbar>
    </Transition>
  </Stack>
</template>

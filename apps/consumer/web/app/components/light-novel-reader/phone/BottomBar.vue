<script setup lang="ts">
  import { Grid, Inline, Progress, Ripple, Stack, Text } from '@hina-ui/vue'
  import { Highlighter, List, Search, Type } from '@lucide/vue'
  import type { ComponentPublicInstance } from 'vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderPhoneBottomBar' })

  const { location, shell, search } = useReader()
  const { chapter, laid, position } = location
  const root = useTemplateRef<ComponentPublicInstance>('root')
  const { height } = useElementSize(() => root.value?.$el as HTMLElement | undefined, undefined, {
    box: 'border-box',
  })
  watch(height, value => (shell.dock.value = value), { immediate: true })
  onBeforeUnmount(() => (shell.dock.value = 0))

  const percent = computed(() =>
    laid.value && position.value ? Math.floor(position.value.progress * 100) : null,
  )

  function navigate(tab: string) {
    shell.tab.value = tab
    shell.sheet.value = 'toc'
    if (tab === 'search') search.open()
  }

  const actions = [
    { label: '目录', icon: List, tour: 'toc', run: () => navigate('toc') },
    { label: '高亮', icon: Highlighter, tour: undefined, run: () => navigate('highlights') },
    { label: '搜索', icon: Search, tour: 'search', run: () => navigate('search') },
    { label: '设置', icon: Type, tour: 'settings', run: () => (shell.sheet.value = 'settings') },
  ]
</script>

<template>
  <Stack
    ref="root"
    as="footer"
    gap="sm"
    class="absolute inset-x-0 bottom-0 z-10 border-t border-line bg-veil px-3 pt-2.5 pb-[max(--spacing(2),env(safe-area-inset-bottom))] backdrop-blur-md"
  >
    <Inline :wrap="false" align="center" gap="md" data-tour="progress" class="px-1.5">
      <Text size="xs" tone="muted" class="min-w-24 shrink-0 tabular-nums">
        {{ chapter ? `本章 ${chapter.to} / ${chapter.total} 页` : '' }}
      </Text>
      <Progress
        v-if="percent != null"
        :value="percent"
        size="sm"
        aria-label="全书阅读进度"
        class="flex-1"
      />
      <Text size="xs" tone="muted" class="min-w-16 shrink-0 text-end tabular-nums">
        {{ percent == null ? '' : `全书 ${percent}%` }}
      </Text>
    </Inline>
    <Grid as="nav" :cols="4" gap="xs" aria-label="阅读器功能">
      <Stack
        v-for="action in actions"
        :key="action.label"
        as="button"
        type="button"
        align="center"
        gap="xs"
        :data-tour="action.tour"
        class="hn-state-layer hn-interactive rounded-lg py-1 text-muted"
        @click="action.run"
      >
        <Ripple />
        <component :is="action.icon" aria-hidden="true" class="size-5.5" />
        <Text as="span" size="xs" tone="muted">{{ action.label }}</Text>
      </Stack>
    </Grid>
  </Stack>
</template>

<script setup lang="ts">
  import { Divider, IconButton, Inline, Text } from '@hina-ui/vue'
  import { ChevronDown, ChevronUp, X } from '@lucide/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { cn } from '~/utils/cn'

  defineOptions({ name: 'LightNovelReaderSearchBar' })

  const { search, shell } = useReader()
  const { term, results, current, pinned } = search
  const lifted = computed(() => shell.chrome.value && shell.dock.value > 0)
</script>

<template>
  <Transition
    enter-active-class="hn-transition ease-(--hn-ease-enter)"
    leave-active-class="hn-transition ease-(--hn-ease-exit)"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <Inline
      v-if="pinned"
      role="search"
      aria-label="搜索结果导航"
      data-tour="search-bar"
      :wrap="false"
      align="center"
      gap="none"
      :class="
        cn(
          'absolute inset-x-3 bottom-[max(--spacing(4),env(safe-area-inset-bottom))] z-10 rounded-2xl border border-line-strong bg-veil py-1 ps-4 pe-1 shadow-lg backdrop-blur-xl transition-[bottom] duration-200 ease-(--hn-ease-enter)',
          lifted && 'bottom-[calc(var(--reader-dock)+--spacing(3))]',
        )
      "
    >
      <Inline :wrap="false" align="baseline" gap="sm" class="min-w-0 flex-1">
        <Text weight="medium" truncate>{{ term }}</Text>
        <Text size="sm" tone="muted" class="shrink-0 tabular-nums">
          {{ current + 1 }} / {{ results.length }}
        </Text>
      </Inline>
      <IconButton
        label="上一处"
        size="lg"
        variant="ghost"
        tone="neutral"
        @click="search.step(false)"
      >
        <ChevronUp aria-hidden="true" />
      </IconButton>
      <IconButton
        label="下一处"
        size="lg"
        variant="ghost"
        tone="neutral"
        @click="search.step(true)"
      >
        <ChevronDown aria-hidden="true" />
      </IconButton>
      <Divider orientation="vertical" class="mx-0.5 h-5 self-center" />
      <IconButton label="关闭搜索" size="lg" variant="ghost" tone="neutral" @click="search.close()">
        <X aria-hidden="true" />
      </IconButton>
    </Inline>
  </Transition>
</template>

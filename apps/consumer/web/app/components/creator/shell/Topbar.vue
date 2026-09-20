<script setup lang="ts">
  import { House, Menu, PanelLeftClose, PanelLeftOpen } from '@lucide/vue'
  import { useScroll } from '@vueuse/core'

  const props = defineProps<{ sidebarCollapsed: boolean }>()
  defineEmits<{ toggleNav: []; toggleSidebar: [] }>()

  const route = useRoute()
  const title = computed(() => (route.meta.title as string | undefined) ?? '创作者中心')
  const sidebarToggleLabel = computed(() => (props.sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'))
  const SidebarToggleIcon = computed(() =>
    props.sidebarCollapsed ? PanelLeftOpen : PanelLeftClose,
  )

  const { subtitle } = useCreatorTopbar()
  const { y } = useScroll(() => (import.meta.client ? window : null))
  const showSubtitle = computed(() => !!subtitle.value && y.value > 32)
</script>

<template>
  <header
    class="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-surface-200 bg-surface-0/80 px-4 backdrop-blur-md dark:border-surface-800 dark:bg-surface-900/80"
  >
    <Button
      unstyled
      type="button"
      class="-ml-1 inline-flex size-9 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 md:hidden dark:text-surface-300 dark:hover:bg-surface-800"
      aria-label="打开导航"
      @click="$emit('toggleNav')"
    >
      <template #icon>
        <Menu class="size-4" aria-hidden="true" />
      </template>
    </Button>
    <Button
      v-tooltip.bottom="sidebarToggleLabel"
      unstyled
      type="button"
      class="-ml-1 hidden size-9 items-center justify-center rounded-lg text-surface-600 transition-colors hover:bg-surface-100 md:inline-flex dark:text-surface-300 dark:hover:bg-surface-800"
      :aria-label="sidebarToggleLabel"
      :aria-pressed="sidebarCollapsed"
      @click="$emit('toggleSidebar')"
    >
      <template #icon>
        <component :is="SidebarToggleIcon" class="size-4" aria-hidden="true" />
      </template>
    </Button>
    <div class="flex min-w-0 flex-1 items-baseline gap-2">
      <h1 class="shrink-0 text-base font-semibold">{{ title }}</h1>
      <Transition
        enter-active-class="transition-opacity duration-200"
        leave-active-class="transition-opacity duration-200"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <span
          v-if="showSubtitle"
          class="flex min-w-0 items-baseline gap-2 text-sm text-muted-color"
        >
          <span class="text-surface-300 dark:text-surface-700" aria-hidden="true">/</span>
          <span class="truncate">{{ subtitle }}</span>
        </span>
      </Transition>
    </div>
    <Button
      as="router-link"
      to="/"
      label="返回"
      variant="text"
      size="small"
      severity="secondary"
      class="py-1!"
    >
      <template #icon>
        <House aria-hidden="true" />
      </template>
    </Button>
    <ThemeToggle />
  </header>
</template>

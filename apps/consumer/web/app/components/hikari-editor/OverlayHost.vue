<script setup lang="ts">
  import Popover from 'primevue/popover'
  import type { EditorPlugin } from './plugins/types'
  import { useOverlayHost } from './composables/useOverlayHost'

  const props = defineProps<{ plugins: EditorPlugin[] }>()
  const popoverRef = useTemplateRef<InstanceType<typeof Popover>>('popoverRef')
  const {
    active,
    isMobile,
    renderedComp,
    renderedProps,
    overlayKey,
    onPopoverHide,
    onDrawerVisible,
  } = useOverlayHost(() => props.plugins, popoverRef)
</script>

<template>
  <Popover
    v-if="!isMobile"
    ref="popoverRef"
    :anchor="false"
    :dismissable="false"
    :pt="{ root: { class: 'popover-no-arrow' } }"
    @hide="onPopoverHide"
  >
    <component :is="renderedComp" v-if="renderedComp" :key="overlayKey" v-bind="renderedProps" />
  </Popover>

  <Drawer
    v-else
    :visible="!!active"
    position="bottom"
    :show-close-icon="false"
    :pt="{
      root: { class: 'app-mobile-sheet', style: 'height: 60dvh' },
      header: { style: 'display: none' },
      content: {
        class: '!flex !h-full !min-h-0 !flex-col',
        style: 'padding: 1.25rem 1rem',
      },
    }"
    @update:visible="onDrawerVisible"
  >
    <component
      :is="renderedComp"
      v-if="renderedComp"
      :key="overlayKey"
      v-bind="renderedProps"
      class="flex h-full min-h-0 w-full flex-col"
    />
  </Drawer>
</template>

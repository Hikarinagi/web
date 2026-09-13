<script setup lang="ts">
  import { breakpointsTailwind } from '@vueuse/core'
  import Popover from 'primevue/popover'
  import { useMediaLibrary } from './composables/useMediaLibrary'

  const { visible, finish, style, anchor } = useMediaLibrary()

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')
  const useDrawer = computed(() => isMobile.value)

  const popoverRef = useTemplateRef<InstanceType<typeof Popover>>('popoverRef')

  function onDialogVisible(value: boolean) {
    if (!value) finish([])
  }

  function onPopoverHide() {
    if (visible.value) finish([])
  }

  watch(
    [visible, style, anchor, useDrawer],
    ([v, s, a, drawer]) => {
      if (s !== 'popover' || drawer) return
      nextTick(() => {
        if (v && a && popoverRef.value) {
          const syntheticEvent = { currentTarget: a, target: a } as unknown as Event
          popoverRef.value.show(syntheticEvent)
        } else if (!v && popoverRef.value) {
          popoverRef.value.hide()
        }
      })
    },
    { immediate: false },
  )
</script>

<template>
  <Drawer
    v-if="useDrawer"
    :visible="visible"
    position="bottom"
    :show-close-icon="false"
    :pt="{
      root: { class: 'app-mobile-sheet h-[82dvh]!' },
      header: { style: 'display: none' },
      content: {
        class: '!flex !h-full !min-h-0 !flex-col',
        style: 'padding: 1.25rem 1rem',
      },
    }"
    @update:visible="onDialogVisible"
  >
    <MediaLibraryBrowser v-if="visible" class="h-full min-h-0" />
  </Drawer>

  <Dialog
    v-else-if="style === 'dialog'"
    dismissable-mask
    :visible="visible"
    modal
    header="我的媒体库"
    :scroll="false"
    :style="{ width: '52rem' }"
    :breakpoints="{ '768px': '95vw' }"
    @update:visible="onDialogVisible"
  >
    <MediaLibraryBrowser v-if="visible" />
  </Dialog>

  <Popover
    v-else
    ref="popoverRef"
    :pt="{
      root: { style: 'width: 560px', class: 'popover-no-arrow' },
    }"
    @hide="onPopoverHide"
  >
    <MediaLibraryBrowser v-if="visible" />
  </Popover>
</template>

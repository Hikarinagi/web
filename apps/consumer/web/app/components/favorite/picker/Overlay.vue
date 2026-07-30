<script setup lang="ts">
  import { breakpointsTailwind } from '@vueuse/core'
  import type Popover from 'primevue/popover'
  import type { FavoriteEntityType } from '~/features/favorite/entity'

  defineOptions({ name: 'FavoritePickerOverlay' })

  defineProps<{ type: FavoriteEntityType; id: number; pickerTitle?: string }>()

  const breakpoints = useBreakpoints(breakpointsTailwind)
  const isMobile = breakpoints.smaller('md')

  const popover = ref<InstanceType<typeof Popover> | null>(null)
  const drawerOpen = ref(false)
  const sessionKey = ref(0)

  function open(event: Event) {
    sessionKey.value += 1
    if (isMobile.value) {
      drawerOpen.value = true
    } else {
      popover.value?.toggle(event)
    }
  }

  function close() {
    drawerOpen.value = false
    popover.value?.hide()
  }

  defineExpose({ open })
</script>

<template>
  <Popover
    v-if="!isMobile"
    ref="popover"
    :pt="{ root: { class: 'popover-no-arrow' }, content: { class: 'p-0! w-[360px]!' } }"
  >
    <FavoriteCollectionPanel :id="id" :key="sessionKey" :type="type" :heading="pickerTitle" />
  </Popover>

  <Drawer
    v-else
    v-model:visible="drawerOpen"
    position="bottom"
    :show-close-icon="false"
    :pt="{
      root: { class: 'app-mobile-sheet h-[60vh]! max-h-[60vh]!' },
      header: { style: 'display: none' },
      content: { class: 'h-full! p-0!' },
    }"
  >
    <FavoriteCollectionPanel
      :id="id"
      :key="sessionKey"
      :type="type"
      :heading="pickerTitle"
      class="h-full! max-h-none!"
      show-done
      @done="close"
    />
  </Drawer>
</template>

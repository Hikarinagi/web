<script setup lang="ts">
  import { Dialog, Popover } from '@hina-ui/vue'
  import { useMediaLibrary } from './composables/useMediaLibrary'

  const { visible, finish, style, anchor } = useMediaLibrary()

  function onOpenChange(value: boolean | undefined) {
    if (!value) finish([])
  }
</script>

<template>
  <Dialog
    v-if="style === 'dialog'"
    :open="visible"
    title="我的媒体库"
    size="2xl"
    @update:open="onOpenChange"
  >
    <template #content>
      <MediaLibraryBrowser />
    </template>
  </Dialog>

  <Popover
    v-else
    :open="visible"
    :anchor="anchor"
    align="start"
    :padded="false"
    class="w-140 p-2"
    @update:open="onOpenChange"
  >
    <template #content>
      <MediaLibraryBrowser />
    </template>
  </Popover>
</template>

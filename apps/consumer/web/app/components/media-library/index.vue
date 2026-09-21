<script setup lang="ts">
  import { Dialog, Popover, Sheet, Stack } from '@hina-ui/vue'
  import { useMediaLibrary } from './composables/useMediaLibrary'

  const { visible, finish, style, anchor } = useMediaLibrary()
  const narrow = useNarrow()
  const mounted = useMounted()
  const asSheet = computed(() => mounted.value && narrow.value)
  const asPopover = computed(() => style.value === 'popover' && !asSheet.value)

  function onOpenChange(value: boolean | undefined) {
    if (!value) finish([])
  }
</script>

<template>
  <Sheet v-if="asSheet" :open="visible" title="我的媒体库" @update:open="onOpenChange">
    <template #content>
      <MediaLibraryBrowser />
    </template>
    <template #footer>
      <MediaLibraryActions />
    </template>
  </Sheet>

  <Popover
    v-else-if="asPopover"
    :open="visible"
    :anchor="anchor"
    align="start"
    :padded="false"
    class="w-140 p-2"
    @update:open="onOpenChange"
  >
    <template #content>
      <Stack gap="sm">
        <MediaLibraryBrowser />
        <MediaLibraryActions class="border-t border-line pt-3" />
      </Stack>
    </template>
  </Popover>

  <Dialog v-else :open="visible" title="我的媒体库" size="2xl" @update:open="onOpenChange">
    <template #content>
      <MediaLibraryBrowser />
    </template>
    <template #footer>
      <MediaLibraryActions />
    </template>
  </Dialog>
</template>

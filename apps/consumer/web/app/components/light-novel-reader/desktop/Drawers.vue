<script setup lang="ts">
  import { Drawer } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderDesktopDrawers' })

  const { shell } = useReader()
  const { medium, wide, drawer } = shell

  const toc = computed({
    get: () => !medium.value && drawer.value === 'left',
    set: open => (drawer.value = open ? 'left' : null),
  })
  const settings = computed({
    get: () => !wide.value && drawer.value === 'settings',
    set: open => (drawer.value = open ? 'settings' : null),
  })
</script>

<template>
  <Drawer v-model:open="toc" title="导航" side="start" size="sm">
    <template #body="{ close }">
      <LightNovelReaderNavigationPanel standalone @close="close" />
    </template>
  </Drawer>
  <Drawer v-model:open="settings" title="阅读设置" side="end" size="md">
    <template #body="{ close }">
      <LightNovelReaderPanel title="阅读设置" @close="close">
        <LightNovelReaderSettingsPanel />
        <template #footer><LightNovelReaderSettingsFooter /></template>
      </LightNovelReaderPanel>
    </template>
  </Drawer>
</template>

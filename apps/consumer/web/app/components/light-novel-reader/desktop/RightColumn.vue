<script setup lang="ts">
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderDesktopRightColumn' })

  const { shell } = useReader()
  const { rightDocked } = shell
</script>

<template>
  <LightNovelReaderDesktopColumn side="right" label="阅读设置" :open="rightDocked !== null">
    <LightNovelReaderPanel title="阅读设置" @close="shell.togglePanel('settings')">
      <LightNovelReaderSettingsPanel />
      <template #footer><LightNovelReaderSettingsFooter /></template>
    </LightNovelReaderPanel>
  </LightNovelReaderDesktopColumn>
</template>

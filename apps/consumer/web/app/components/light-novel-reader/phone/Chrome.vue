<script setup lang="ts">
  import { Sheet } from '@hina-ui/vue'
  import type { LightNovelVolumeReaderPageData } from '~~/server/api/pages/light-novel-volumes/[id]/reader.get'
  import { useReader } from '~/features/light-novel-reader/context'

  defineOptions({ name: 'LightNovelReaderPhoneChrome' })

  defineProps<{ data: LightNovelVolumeReaderPageData }>()

  const { shell } = useReader()
  const { chrome, sheet } = shell

  const toc = computed({
    get: () => sheet.value === 'toc',
    set: open => (sheet.value = open ? 'toc' : null),
  })
  const settings = computed({
    get: () => sheet.value === 'settings',
    set: open => (sheet.value = open ? 'settings' : null),
  })
</script>

<template>
  <Transition
    enter-active-class="hn-transition ease-(--hn-ease-enter)"
    leave-active-class="hn-transition ease-(--hn-ease-exit)"
    enter-from-class="-translate-y-2 opacity-0"
    leave-to-class="-translate-y-2 opacity-0"
  >
    <LightNovelReaderPhoneTopBar v-if="chrome" :data="data" />
  </Transition>
  <Transition
    enter-active-class="hn-transition ease-(--hn-ease-enter)"
    leave-active-class="hn-transition ease-(--hn-ease-exit)"
    enter-from-class="translate-y-2 opacity-0"
    leave-to-class="translate-y-2 opacity-0"
  >
    <LightNovelReaderPhoneBottomBar v-if="chrome && data.reader" />
  </Transition>
  <template v-if="data.reader">
    <Sheet v-model:open="toc" title="导航" class="h-(--reader-sheet-height)">
      <template #body><LightNovelReaderNavigationPanel /></template>
    </Sheet>
    <Sheet v-model:open="settings" title="阅读设置">
      <template #content><LightNovelReaderSettingsPanel /></template>
      <template #footer><LightNovelReaderSettingsFooter /></template>
    </Sheet>
  </template>
</template>

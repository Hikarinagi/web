<script setup lang="ts">
  import { Heading, Popover, Sheet, Stack } from '@hina-ui/vue'
  import { cn } from '~/utils/cn'
  import type { MangaReaderDirection, MangaReaderMode, MangaReaderSettings } from '../lib/settings'

  defineOptions({ name: 'MangaReaderSettingsPanel' })

  defineProps<{ narrow: boolean; dark: boolean; anchor: HTMLElement | null }>()
  const open = defineModel<boolean>('open', { required: true })
  const settings = defineModel<MangaReaderSettings>('settings', { required: true })
  const mode = defineModel<MangaReaderMode>('mode', { required: true })
  const direction = defineModel<MangaReaderDirection>('direction', { required: true })
  const emit = defineEmits<{ guide: [] }>()

  function guide() {
    open.value = false
    emit('guide')
  }
</script>

<template>
  <Sheet v-if="narrow" v-model:open="open" title="阅读设置" :class="dark ? 'dark' : undefined">
    <template #content>
      <MangaReaderSettingsForm
        v-model:settings="settings"
        v-model:mode="mode"
        v-model:direction="direction"
        :narrow="true"
        @guide="guide"
      />
    </template>
  </Sheet>
  <Popover
    v-else
    v-model:open="open"
    :anchor="anchor"
    side="bottom"
    align="end"
    :class="cn('w-80', dark && 'dark')"
    aria-label="阅读设置"
  >
    <template #content>
      <Stack gap="md">
        <Heading :level="2" size="sm">阅读设置</Heading>
        <MangaReaderSettingsForm
          v-model:settings="settings"
          v-model:mode="mode"
          v-model:direction="direction"
          :narrow="false"
          @guide="guide"
        />
      </Stack>
    </template>
  </Popover>
</template>

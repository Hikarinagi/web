<script setup lang="ts">
  import {
    Button,
    FormField,
    Heading,
    Popover,
    SegmentedControl,
    Stack,
    Switch,
  } from '@hina-ui/vue'
  import {
    MANGA_READER_BACKGROUND_OPTIONS,
    MANGA_READER_FIT_OPTIONS,
    MANGA_READER_LAYOUT_OPTIONS,
    type MangaReaderBackground,
    type MangaReaderFit,
    type MangaReaderLayout,
    type MangaReaderSettings,
  } from './lib/settings'

  defineOptions({ name: 'MangaReaderSettingsPopover' })

  const settings = defineModel<MangaReaderSettings>('settings', { required: true })
  const open = defineModel<boolean>('open', { required: true })

  defineProps<{
    anchor: HTMLElement | null
    showLayoutControls: boolean
  }>()

  const emit = defineEmits<{ replayEducation: [] }>()

  function update(patch: Partial<MangaReaderSettings>) {
    settings.value = { ...settings.value, ...patch }
  }

  function replay() {
    open.value = false
    emit('replayEducation')
  }
</script>

<template>
  <Popover v-model:open="open" :anchor="anchor" side="top" align="end" class="w-80">
    <template #content>
      <Stack>
        <Heading :level="3" size="sm">阅读设置</Heading>

        <FormField v-if="showLayoutControls" label="页面布局">
          <SegmentedControl
            :model-value="settings.layout"
            :options="MANGA_READER_LAYOUT_OPTIONS"
            size="sm"
            block
            @update:model-value="value => update({ layout: value as MangaReaderLayout })"
          />
        </FormField>

        <FormField v-if="showLayoutControls" label="图片适应">
          <SegmentedControl
            :model-value="settings.fit"
            :options="MANGA_READER_FIT_OPTIONS"
            size="sm"
            block
            @update:model-value="value => update({ fit: value as MangaReaderFit })"
          />
        </FormField>

        <FormField label="背景">
          <SegmentedControl
            :model-value="settings.background"
            :options="MANGA_READER_BACKGROUND_OPTIONS"
            size="sm"
            block
            @update:model-value="value => update({ background: value as MangaReaderBackground })"
          />
        </FormField>

        <Switch
          :model-value="settings.show_page_number"
          size="sm"
          control-placement="end"
          block
          @update:model-value="value => update({ show_page_number: value })"
        >
          显示页码
        </Switch>

        <Switch
          :model-value="settings.page_animation"
          size="sm"
          control-placement="end"
          block
          @update:model-value="value => update({ page_animation: value })"
        >
          翻页动画
        </Switch>

        <Button variant="link" size="sm" class="self-start" @click="replay">操作说明</Button>
      </Stack>
    </template>
  </Popover>
</template>

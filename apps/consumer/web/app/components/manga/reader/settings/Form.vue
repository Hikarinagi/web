<script setup lang="ts">
  import { Button, FormField, SegmentedControl, Stack, Switch } from '@hina-ui/vue'
  import {
    MANGA_READER_BACKGROUND_OPTIONS,
    MANGA_READER_DIRECTION_OPTIONS,
    MANGA_READER_FIT_OPTIONS,
    MANGA_READER_LAYOUT_OPTIONS,
    MANGA_READER_MODE_OPTIONS,
    type MangaReaderBackground,
    type MangaReaderDirection,
    type MangaReaderFit,
    type MangaReaderLayout,
    type MangaReaderMode,
    type MangaReaderSettings,
  } from '../lib/settings'

  defineOptions({ name: 'MangaReaderSettingsForm' })

  defineProps<{ narrow: boolean }>()
  const settings = defineModel<MangaReaderSettings>('settings', { required: true })
  const mode = defineModel<MangaReaderMode>('mode', { required: true })
  const direction = defineModel<MangaReaderDirection>('direction', { required: true })
  const emit = defineEmits<{ guide: [] }>()

  function update(patch: Partial<MangaReaderSettings>) {
    settings.value = { ...settings.value, ...patch }
  }
</script>

<template>
  <Stack gap="md">
    <FormField label="阅读方式">
      <SegmentedControl
        :model-value="mode"
        :options="MANGA_READER_MODE_OPTIONS"
        size="sm"
        block
        @update:model-value="value => (mode = value as MangaReaderMode)"
      />
    </FormField>
    <FormField v-if="mode === 'paged'" label="翻页方向">
      <SegmentedControl
        :model-value="direction"
        :options="MANGA_READER_DIRECTION_OPTIONS"
        size="sm"
        block
        @update:model-value="value => (direction = value as MangaReaderDirection)"
      />
    </FormField>
    <template v-if="!narrow && mode === 'paged'">
      <FormField label="页面布局">
        <SegmentedControl
          :model-value="settings.layout"
          :options="MANGA_READER_LAYOUT_OPTIONS"
          size="sm"
          block
          @update:model-value="value => update({ layout: value as MangaReaderLayout })"
        />
      </FormField>
      <Switch
        :model-value="settings.cover_alone"
        size="sm"
        control-placement="end"
        block
        @update:model-value="value => update({ cover_alone: value })"
      >
        第一页单独显示
      </Switch>
      <FormField label="图片适应">
        <SegmentedControl
          :model-value="settings.fit"
          :options="MANGA_READER_FIT_OPTIONS"
          size="sm"
          block
          @update:model-value="value => update({ fit: value as MangaReaderFit })"
        />
      </FormField>
    </template>
    <FormField label="背景">
      <SegmentedControl
        :model-value="settings.background"
        :options="MANGA_READER_BACKGROUND_OPTIONS"
        size="sm"
        block
        @update:model-value="value => update({ background: value as MangaReaderBackground })"
      />
    </FormField>
    <Stack gap="sm">
      <Switch
        v-if="mode === 'paged'"
        :model-value="settings.tap_sides"
        size="sm"
        control-placement="end"
        block
        @update:model-value="value => update({ tap_sides: value })"
      >
        点击两侧翻页
      </Switch>
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
        v-if="mode === 'paged'"
        :model-value="settings.page_animation"
        size="sm"
        control-placement="end"
        block
        @update:model-value="value => update({ page_animation: value })"
      >
        翻页动画
      </Switch>
    </Stack>
    <Button variant="link" size="sm" class="self-start" @click="emit('guide')">操作说明</Button>
  </Stack>
</template>

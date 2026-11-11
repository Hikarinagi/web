<script setup lang="ts">
  import { Divider, SegmentedControl, Stack, Switch, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import {
    deviceDefaults,
    READER_EFFECTS,
    READER_FLOWS,
    READER_RANGES,
    READER_SPREADS,
    type ReaderEffect,
    type ReaderFlow,
    type ReaderSpread,
    widestPage,
  } from '~/features/light-novel-reader/settings'

  defineOptions({ name: 'LightNovelReaderSettingsPanel' })

  const { settings } = useReader()
  const { device, phone } = settings
  const wakeLock = useWakeLock()
  const { width: windowWidth } = useWindowSize()
  const pageMax = computed(() => widestPage(windowWidth.value))

  const flow = computed({
    get: () => device.value.flow,
    set: value => settings.update('flow', value as ReaderFlow),
  })
  const paged = computed(() => device.value.flow === 'paged')
  const spread = computed({
    get: () => device.value.spread,
    set: value => settings.update('spread', value as ReaderSpread),
  })
  const effect = computed({
    get: () => device.value.effect,
    set: value => settings.update('effect', value as ReaderEffect),
  })
</script>

<template>
  <Stack gap="lg">
    <Stack gap="sm" data-tour="settings-theme">
      <Text size="sm" tone="muted">主题</Text>
      <LightNovelReaderSettingsThemes />
    </Stack>
    <Stack gap="sm">
      <Text size="sm" tone="muted">字体</Text>
      <LightNovelReaderSettingsFonts />
    </Stack>
    <LightNovelReaderSettingsRange
      data-tour="settings-size"
      label="字号"
      :value="device.fontSize"
      v-bind="READER_RANGES.fontSize"
      @change="settings.update('fontSize', $event)"
    />
    <LightNovelReaderSettingsRange
      label="行距"
      :value="device.lineHeight"
      v-bind="READER_RANGES.lineHeight"
      :digits="1"
      @change="settings.update('lineHeight', $event)"
    />
    <LightNovelReaderSettingsRange
      label="页边距"
      :value="device.margin"
      v-bind="READER_RANGES.margin"
      @change="settings.update('margin', $event)"
    />
    <Stack gap="sm">
      <Text size="sm" tone="muted">阅读方式</Text>
      <SegmentedControl v-model="flow" :options="[...READER_FLOWS]" block aria-label="阅读方式" />
    </Stack>
    <LightNovelReaderSettingsRange
      v-if="!paged && windowWidth > READER_RANGES.pageWidth.min"
      label="页面宽度"
      :value="Math.min(device.pageWidth, pageMax)"
      :min="READER_RANGES.pageWidth.min"
      :max="pageMax"
      :step="READER_RANGES.pageWidth.step"
      :default-value="deviceDefaults(phone).pageWidth"
      @change="settings.update('pageWidth', $event)"
    />
    <Stack v-if="!phone && paged" gap="sm">
      <Text size="sm" tone="muted">排列</Text>
      <SegmentedControl v-model="spread" :options="[...READER_SPREADS]" block aria-label="排列" />
    </Stack>
    <Stack v-if="paged" gap="sm">
      <Text size="sm" tone="muted">翻页效果</Text>
      <SegmentedControl
        v-model="effect"
        :options="[...READER_EFFECTS]"
        block
        aria-label="翻页效果"
      />
    </Stack>
    <Divider />
    <Stack gap="md">
      <Switch
        v-if="paged"
        data-tour="settings-tap"
        :model-value="device.tapTurn"
        @update:model-value="settings.update('tapTurn', Boolean($event))"
      >
        点击两侧翻页
      </Switch>
      <Switch
        v-if="!phone"
        :model-value="device.showTime"
        @update:model-value="settings.update('showTime', Boolean($event))"
      >
        显示时间
      </Switch>
      <Switch
        v-else
        :model-value="wakeLock.isSupported.value && device.keepAwake"
        :disabled="!wakeLock.isSupported.value"
        :description="wakeLock.isSupported.value ? undefined : '当前浏览器不支持此功能'"
        @update:model-value="settings.update('keepAwake', Boolean($event))"
      >
        保持屏幕常亮
      </Switch>
      <Switch
        :model-value="device.showGuide"
        @update:model-value="settings.update('showGuide', Boolean($event))"
      >
        显示操作指引
      </Switch>
    </Stack>
  </Stack>
</template>

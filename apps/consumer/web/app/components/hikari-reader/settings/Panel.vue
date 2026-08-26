<script setup lang="ts">
  import type { BackendReaderSettings } from '~/components/hikari-reader/types'
  import type { HikariReaderDeviceSettings } from '../lib/device-settings'
  import {
    READER_FONT_FAMILIES,
    READER_FONT_SIZE_RANGE,
    READER_LINE_HEIGHT_RANGE,
    READER_MARGIN_RANGE,
    READER_SYSTEM_THEME_INDEX,
    READER_THEME_PRESETS,
  } from '../lib/presets'

  defineOptions({ name: 'HikariReaderSettingsPanel' })

  const emit = defineEmits<{ replayEducation: [] }>()

  const settings = defineModel<BackendReaderSettings>('settings', { required: true })
  const device = defineModel<HikariReaderDeviceSettings>('device', { required: true })
  const visible = defineModel<boolean>('visible', { required: true })

  function applyPreset(index: number) {
    const preset = READER_THEME_PRESETS.find(item => item.index === index)
    if (!preset) return
    settings.value = {
      ...settings.value,
      theme_index: preset.index,
      background_color: preset.backgroundColor,
      text_color: preset.textColor,
    }
  }

  function applySystem() {
    settings.value = { ...settings.value, theme_index: READER_SYSTEM_THEME_INDEX }
  }

  function patch<K extends keyof BackendReaderSettings>(key: K, value: BackendReaderSettings[K]) {
    settings.value = { ...settings.value, [key]: value }
  }

  function patchDevice<K extends keyof HikariReaderDeviceSettings>(
    key: K,
    value: HikariReaderDeviceSettings[K],
  ) {
    device.value = { ...device.value, [key]: value }
  }
</script>

<template>
  <Drawer v-model:visible="visible" position="right" class="w-full! max-w-96!">
    <template #header>阅读设置</template>

    <div class="flex flex-col gap-6 px-1 py-2">
      <section class="space-y-2">
        <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">主题</h3>
        <div class="grid grid-cols-4 gap-2">
          <Button
            v-tooltip.top="'跟随系统'"
            unstyled
            type="button"
            class="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border text-xs font-medium transition-all"
            :class="
              settings.theme_index === READER_SYSTEM_THEME_INDEX
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-surface-200 dark:border-surface-700'
            "
            :style="{ backgroundImage: 'linear-gradient(135deg, #ffffff 0 50%, #1f2227 50% 100%)' }"
            @click="applySystem"
          >
            <span class="text-white mix-blend-difference">系统</span>
          </Button>
          <Button
            v-for="preset in READER_THEME_PRESETS"
            :key="preset.index"
            unstyled
            type="button"
            class="relative flex aspect-square items-center justify-center rounded-lg border text-xs font-medium transition-all"
            :class="
              settings.theme_index === preset.index
                ? 'border-primary ring-2 ring-primary/30'
                : 'border-surface-200 dark:border-surface-700'
            "
            :style="{
              backgroundColor: preset.backgroundColor,
              color: preset.textColor,
            }"
            @click="applyPreset(preset.index)"
          >
            {{ preset.label }}
          </Button>
        </div>
      </section>

      <section class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">字号</h3>
          <span class="text-xs text-muted-color tabular-nums">{{ settings.font_size }}px</span>
        </div>
        <Slider
          :model-value="settings.font_size"
          :min="READER_FONT_SIZE_RANGE.min"
          :max="READER_FONT_SIZE_RANGE.max"
          :step="READER_FONT_SIZE_RANGE.step"
          @update:model-value="
            value => patch('font_size', Array.isArray(value) ? value[0]! : value)
          "
        />
      </section>

      <section class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">行距</h3>
          <span class="text-xs text-muted-color tabular-nums">
            {{ settings.line_height.toFixed(1) }}
          </span>
        </div>
        <Slider
          :model-value="settings.line_height"
          :min="READER_LINE_HEIGHT_RANGE.min"
          :max="READER_LINE_HEIGHT_RANGE.max"
          :step="READER_LINE_HEIGHT_RANGE.step"
          @update:model-value="
            value => patch('line_height', Array.isArray(value) ? value[0]! : value)
          "
        />
      </section>

      <section class="space-y-2">
        <div class="flex items-center justify-between">
          <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">页边距</h3>
          <span class="text-xs text-muted-color tabular-nums">{{ settings.margins }}px</span>
        </div>
        <Slider
          :model-value="settings.margins"
          :min="READER_MARGIN_RANGE.min"
          :max="READER_MARGIN_RANGE.max"
          :step="READER_MARGIN_RANGE.step"
          @update:model-value="value => patch('margins', Array.isArray(value) ? value[0]! : value)"
        />
      </section>

      <section class="space-y-2">
        <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">字体</h3>
        <Select
          :model-value="settings.font_family"
          :options="READER_FONT_FAMILIES"
          option-label="label"
          option-value="value"
          class="w-full"
          @update:model-value="value => patch('font_family', value)"
        />
      </section>

      <section class="space-y-3">
        <HikariReaderSettingsToggleRow
          :model-value="settings.show_progress"
          label="显示进度"
          description="底部工具栏显示阅读进度"
          @update:model-value="value => patch('show_progress', value)"
        />
        <HikariReaderSettingsToggleRow
          :model-value="settings.show_time"
          label="显示时间"
          description="底部工具栏显示当前时间"
          @update:model-value="value => patch('show_time', value)"
        />
        <HikariReaderSettingsToggleRow
          :model-value="settings.keep_screen_on"
          label="保持屏幕常亮"
          description="在支持的浏览器上阅读时防止息屏"
          @update:model-value="value => patch('keep_screen_on', value)"
        />
      </section>

      <section class="space-y-3">
        <div class="space-y-1">
          <h3 class="text-xs font-semibold tracking-wide text-muted-color uppercase">本设备</h3>
          <p class="text-xs text-muted-color">以下选项只在当前设备生效，不会同步到其他设备</p>
        </div>
        <HikariReaderSettingsToggleRow
          :model-value="device.page_animation"
          label="翻页动画"
          description="关闭后翻页直接切换，适合水墨屏等低刷新率设备"
          @update:model-value="value => patchDevice('page_animation', value)"
        />
        <HikariReaderSettingsToggleRow
          :model-value="device.tap_zones"
          label="点击区域翻页"
          description="左侧 1/3 上一页，右侧 1/3 下一页，中间呼出工具栏"
          @update:model-value="value => patchDevice('tap_zones', value)"
        />
      </section>

      <section>
        <Button
          text
          size="small"
          label="操作说明"
          class="px-0!"
          @click="
            () => {
              visible = false
              emit('replayEducation')
            }
          "
        />
      </section>
    </div>
  </Drawer>
</template>

<script setup lang="ts">
  import type { BackendReaderSettings } from '~/components/hikari-reader/types'
  import {
    READER_FONT_FAMILIES,
    READER_FONT_SIZE_RANGE,
    READER_LINE_HEIGHT_RANGE,
    READER_MARGIN_RANGE,
    READER_SYSTEM_THEME_INDEX,
    READER_THEME_PRESETS,
  } from './lib/presets'

  defineOptions({ name: 'HikariReaderSettingsPanel' })

  const settings = defineModel<BackendReaderSettings>('settings', { required: true })
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
        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <p class="text-sm">显示进度</p>
            <p class="text-xs text-muted-color">底部工具栏显示阅读进度</p>
          </div>
          <ToggleSwitch
            :model-value="settings.show_progress"
            @update:model-value="value => patch('show_progress', value)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <p class="text-sm">显示时间</p>
            <p class="text-xs text-muted-color">底部工具栏显示当前时间</p>
          </div>
          <ToggleSwitch
            :model-value="settings.show_time"
            @update:model-value="value => patch('show_time', value)"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="space-y-0.5">
            <p class="text-sm">保持屏幕常亮</p>
            <p class="text-xs text-muted-color">在支持的浏览器上阅读时防止息屏</p>
          </div>
          <ToggleSwitch
            :model-value="settings.keep_screen_on"
            @update:model-value="value => patch('keep_screen_on', value)"
          />
        </div>
      </section>
    </div>
  </Drawer>
</template>

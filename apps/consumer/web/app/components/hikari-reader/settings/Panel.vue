<script setup lang="ts">
  import {
    Button,
    Drawer,
    Grid,
    Heading,
    Inline,
    Select,
    Slider,
    Stack,
    Switch,
    Text,
  } from '@hina-ui/vue'
  import type { BackendReaderSettings } from '~/components/hikari-reader/types'
  import { cn } from '~/utils/cn'
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

  const EYEBROW = 'tracking-wide text-muted uppercase'

  // Select 把空串保留给「清空选择」，而「跟随书籍」在后端就存空串
  const FONT_FAMILY_INHERIT = 'book'
  const fontFamilyOptions = READER_FONT_FAMILIES.map(item => ({
    ...item,
    value: item.value || FONT_FAMILY_INHERIT,
  }))
  const fontFamily = computed(() => settings.value.font_family || FONT_FAMILY_INHERIT)

  function setFontFamily(value: string | number | null | undefined) {
    patch('font_family', value === FONT_FAMILY_INHERIT ? '' : String(value ?? ''))
  }

  function swatchClass(selected: boolean) {
    return cn(
      'hn-state-layer aspect-square hn-interactive justify-center rounded-lg border text-xs font-medium',
      selected ? 'border-accent ring-2 ring-accent/30' : 'border-line',
    )
  }

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

  function showEducation() {
    visible.value = false
    emit('replayEducation')
  }
</script>

<template>
  <Drawer v-model:open="visible" side="end" size="md" title="阅读设置">
    <template #content>
      <Stack gap="lg">
        <Stack as="section" gap="sm">
          <Heading :level="3" size="xs" :class="EYEBROW">主题</Heading>
          <Grid :cols="4" gap="sm">
            <Inline
              v-tooltip="'跟随系统'"
              as="button"
              type="button"
              gap="none"
              :class="swatchClass(settings.theme_index === READER_SYSTEM_THEME_INDEX)"
              :style="{
                backgroundImage: 'linear-gradient(135deg, #ffffff 0 50%, #1f2227 50% 100%)',
              }"
              @click="applySystem"
            >
              <Text as="span" size="xs" weight="medium" class="text-white mix-blend-difference">
                系统
              </Text>
            </Inline>
            <Inline
              v-for="preset in READER_THEME_PRESETS"
              :key="preset.index"
              as="button"
              type="button"
              gap="none"
              :class="swatchClass(settings.theme_index === preset.index)"
              :style="{ backgroundColor: preset.backgroundColor, color: preset.textColor }"
              @click="applyPreset(preset.index)"
            >
              {{ preset.label }}
            </Inline>
          </Grid>
        </Stack>

        <Stack as="section" gap="sm">
          <Inline justify="between" align="center">
            <Heading :level="3" size="xs" :class="EYEBROW">字号</Heading>
            <Text size="xs" tone="muted" class="tabular-nums">{{ settings.font_size }}px</Text>
          </Inline>
          <Slider
            :model-value="settings.font_size"
            :min="READER_FONT_SIZE_RANGE.min"
            :max="READER_FONT_SIZE_RANGE.max"
            :step="READER_FONT_SIZE_RANGE.step"
            @update:model-value="value => patch('font_size', value ?? settings.font_size)"
          />
        </Stack>

        <Stack as="section" gap="sm">
          <Inline justify="between" align="center">
            <Heading :level="3" size="xs" :class="EYEBROW">行距</Heading>
            <Text size="xs" tone="muted" class="tabular-nums">
              {{ settings.line_height.toFixed(1) }}
            </Text>
          </Inline>
          <Slider
            :model-value="settings.line_height"
            :min="READER_LINE_HEIGHT_RANGE.min"
            :max="READER_LINE_HEIGHT_RANGE.max"
            :step="READER_LINE_HEIGHT_RANGE.step"
            @update:model-value="value => patch('line_height', value ?? settings.line_height)"
          />
        </Stack>

        <Stack as="section" gap="sm">
          <Inline justify="between" align="center">
            <Heading :level="3" size="xs" :class="EYEBROW">页边距</Heading>
            <Text size="xs" tone="muted" class="tabular-nums">{{ settings.margins }}px</Text>
          </Inline>
          <Slider
            :model-value="settings.margins"
            :min="READER_MARGIN_RANGE.min"
            :max="READER_MARGIN_RANGE.max"
            :step="READER_MARGIN_RANGE.step"
            @update:model-value="value => patch('margins', value ?? settings.margins)"
          />
        </Stack>

        <Stack as="section" gap="sm">
          <Heading :level="3" size="xs" :class="EYEBROW">字体</Heading>
          <Select
            :model-value="fontFamily"
            :options="fontFamilyOptions"
            class="w-full"
            @update:model-value="setFontFamily"
          />
        </Stack>

        <Stack as="section" gap="md">
          <Switch
            block
            control-placement="end"
            :model-value="settings.show_progress"
            description="底部工具栏显示阅读进度"
            @update:model-value="value => patch('show_progress', value)"
          >
            显示进度
          </Switch>
          <Switch
            block
            control-placement="end"
            :model-value="settings.show_time"
            description="底部工具栏显示当前时间"
            @update:model-value="value => patch('show_time', value)"
          >
            显示时间
          </Switch>
          <Switch
            block
            control-placement="end"
            :model-value="settings.keep_screen_on"
            description="在支持的浏览器上阅读时防止息屏"
            @update:model-value="value => patch('keep_screen_on', value)"
          >
            保持屏幕常亮
          </Switch>
        </Stack>

        <Stack as="section" gap="md">
          <Stack gap="xs">
            <Heading :level="3" size="xs" :class="EYEBROW">本设备</Heading>
            <Text size="xs" tone="muted">以下选项只在当前设备生效，不会同步到其他设备</Text>
          </Stack>
          <Switch
            block
            control-placement="end"
            :model-value="device.page_animation"
            description="关闭后翻页直接切换，适合水墨屏等低刷新率设备"
            @update:model-value="value => patchDevice('page_animation', value)"
          >
            翻页动画
          </Switch>
          <Switch
            block
            control-placement="end"
            :model-value="device.tap_zones"
            description="左侧 1/3 上一页，右侧 1/3 下一页"
            @update:model-value="value => patchDevice('tap_zones', value)"
          >
            点击区域翻页
          </Switch>
        </Stack>

        <Stack as="section" gap="none">
          <Button variant="link" tone="neutral" size="sm" class="self-start" @click="showEducation">
            操作说明
          </Button>
        </Stack>
      </Stack>
    </template>
  </Drawer>
</template>

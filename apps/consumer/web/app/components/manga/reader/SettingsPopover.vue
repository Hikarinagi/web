<script setup lang="ts">
  import { cn } from '~/utils/cn'
  import {
    MANGA_READER_BACKGROUND_OPTIONS,
    MANGA_READER_FIT_OPTIONS,
    MANGA_READER_LAYOUT_OPTIONS,
    type MangaReaderSettings,
  } from './lib/settings'

  defineOptions({ name: 'MangaReaderSettingsPopover' })

  const settings = defineModel<MangaReaderSettings>('settings', { required: true })

  defineProps<{ showLayoutControls: boolean }>()

  const emit = defineEmits<{
    show: []
    hide: []
    replayEducation: []
  }>()

  const popover = ref()

  function toggle(event: Event) {
    popover.value?.toggle(event)
  }

  defineExpose({ toggle })

  const optionClass =
    'flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-[13px] transition-colors'

  function optionStateClass(active: boolean) {
    return active ? 'bg-primary/20 text-primary' : 'text-[#b8c2d1] hover:text-white'
  }

  function replay() {
    popover.value?.hide()
    emit('replayEducation')
  }
</script>

<template>
  <Popover
    ref="popover"
    :pt="{
      root: {
        class: '!rounded-2xl !border !border-white/10 !bg-[#10141b] before:!hidden after:!hidden',
      },
      content: { class: '!w-80' },
    }"
    @show="emit('show')"
    @hide="emit('hide')"
  >
    <div class="flex flex-col gap-4">
      <h3 class="text-sm font-semibold text-white">阅读设置</h3>

      <div v-if="showLayoutControls" class="flex flex-col gap-2">
        <p class="text-xs text-[#8b95a6]">页面布局</p>
        <div class="flex gap-1 rounded-lg bg-white/6 p-1">
          <Button
            v-for="option in MANGA_READER_LAYOUT_OPTIONS"
            :key="option.value"
            unstyled
            :class="cn(optionClass, optionStateClass(settings.layout === option.value))"
            @click="settings = { ...settings, layout: option.value }"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>

      <div v-if="showLayoutControls" class="flex flex-col gap-2">
        <p class="text-xs text-[#8b95a6]">图片适应</p>
        <div class="flex gap-1 rounded-lg bg-white/6 p-1">
          <Button
            v-for="option in MANGA_READER_FIT_OPTIONS"
            :key="option.value"
            unstyled
            :class="cn(optionClass, 'px-2', optionStateClass(settings.fit === option.value))"
            @click="settings = { ...settings, fit: option.value }"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <p class="text-xs text-[#8b95a6]">背景</p>
        <div class="flex gap-1 rounded-lg bg-white/6 p-1">
          <Button
            v-for="option in MANGA_READER_BACKGROUND_OPTIONS"
            :key="option.value"
            unstyled
            :class="cn(optionClass, optionStateClass(settings.background === option.value))"
            @click="settings = { ...settings, background: option.value }"
          >
            {{ option.label }}
          </Button>
        </div>
      </div>

      <div class="flex items-center justify-between">
        <label for="manga-reader-show-page-number" class="text-[13px] text-white">显示页码</label>
        <ToggleSwitch
          input-id="manga-reader-show-page-number"
          :model-value="settings.show_page_number"
          @update:model-value="value => (settings = { ...settings, show_page_number: value })"
        />
      </div>

      <div class="flex items-center justify-between">
        <label for="manga-reader-page-animation" class="text-[13px] text-white">翻页动画</label>
        <ToggleSwitch
          input-id="manga-reader-page-animation"
          :model-value="settings.page_animation"
          @update:model-value="value => (settings = { ...settings, page_animation: value })"
        />
      </div>

      <Button
        unstyled
        class="cursor-pointer self-start text-[13px] text-primary transition-colors hover:text-primary/80"
        @click="replay"
      >
        操作说明
      </Button>
    </div>
  </Popover>
</template>

<script setup lang="ts">
  const props = defineProps<{
    initialAlt: string | null
    initialCaption: string | null
    initialWidthPercent: number
    onChange: (patch: {
      alt?: string | null
      caption?: string | null
      width_percent?: number
    }) => void
  }>()

  const MIN_PERCENT = 20
  const MAX_PERCENT = 100
  const SNAP_POINTS = [25, 33, 50, 66, 75, 100]

  const alt = ref(props.initialAlt ?? '')
  const caption = ref(props.initialCaption ?? '')
  const widthPercent = ref(props.initialWidthPercent)

  watchDebounced(alt, value => props.onChange({ alt: value || null }), { debounce: 200 })
  watchDebounced(caption, value => props.onChange({ caption: value || null }), { debounce: 200 })
  watch(widthPercent, value => props.onChange({ width_percent: value }))

  function snapTo(value: number) {
    widthPercent.value = value
  }
</script>

<template>
  <div class="flex w-full flex-col gap-3 md:w-[360px]">
    <div class="flex flex-col gap-1">
      <label for="image-meta-alt" class="text-sm font-medium text-muted-color">
        alt（可访问性描述）
      </label>
      <InputText
        id="image-meta-alt"
        v-model="alt"
        autofocus
        fluid
        size="small"
        placeholder="为屏幕阅读器添加描述"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="image-meta-caption" class="text-sm font-medium text-muted-color">图注</label>
      <InputText
        id="image-meta-caption"
        v-model="caption"
        fluid
        size="small"
        placeholder="图片说明"
      />
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between">
        <label class="text-sm font-medium text-muted-color">宽度</label>
        <span class="text-sm text-color tabular-nums">{{ Math.round(widthPercent) }}%</span>
      </div>
      <Slider v-model="widthPercent" :min="MIN_PERCENT" :max="MAX_PERCENT" :step="1" />
      <div class="flex flex-wrap content-evenly justify-evenly">
        <Button
          v-for="point in SNAP_POINTS"
          :key="point"
          unstyled
          type="button"
          :class="[
            'rounded px-2 py-0.5 text-xs transition-colors',
            Math.round(widthPercent) === point
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-300'
              : 'text-muted-color hover:bg-surface-100 dark:hover:bg-surface-800',
          ]"
          @click="snapTo(point)"
        >
          {{ point }}%
        </Button>
      </div>
    </div>
  </div>
</template>

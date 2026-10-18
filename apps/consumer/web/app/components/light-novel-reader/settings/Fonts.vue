<script setup lang="ts">
  import { Inline, Progress, SegmentedControl, Stack, Text } from '@hina-ui/vue'
  import { useReader } from '~/features/light-novel-reader/context'
  import { FONT_PREVIEWS } from '~/features/light-novel-reader/fonts'
  import { accountFont } from '~/features/light-novel-reader/settings'

  defineOptions({ name: 'LightNovelReaderSettingsFonts' })

  const { engine, fonts, settings } = useReader()
  const { catalogue, ready, pending, failed } = fonts

  onMounted(() => void fonts.refresh())

  const options = computed(() =>
    catalogue.value.map(font => ({
      value: font.id,
      label: font.name,
      family: FONT_PREVIEWS[font.id],
    })),
  )

  const selected = computed({
    get: () => engine.font.value?.id ?? settings.font.value,
    set: id => void fonts.choose(accountFont(id)),
  })

  const missing = computed(() => catalogue.value.filter(font => !ready.value.has(font.id)))
  const downloading = computed(() => {
    const current = pending.value
    const font = current && catalogue.value.find(item => item.id === current.id)
    return font ? { name: font.name, percent: Math.floor(current.progress * 100) } : null
  })
  const sizes = computed(() =>
    missing.value
      .map(font => `${font.name} ${(font.bytes / 1024 / 1024).toFixed(1)} MB`)
      .join('，'),
  )

  const reserve = ref(false)
  watchEffect(() => {
    if (missing.value.length) reserve.value = true
  })
</script>

<template>
  <Stack gap="xs">
    <SegmentedControl
      v-if="options.length"
      v-model="selected"
      :options="options"
      block
      aria-label="字体"
    >
      <template #option="{ option }">
        <span :style="{ fontFamily: option.family }">{{ option.label }}</span>
      </template>
    </SegmentedControl>
    <Inline v-if="reserve || failed" :wrap="false" align="center" gap="sm" class="min-h-lh">
      <Text v-if="failed" size="xs" tone="danger">字体下载失败，请重新选择。</Text>
      <template v-else-if="downloading">
        <Text size="xs" tone="muted" class="shrink-0">正在下载{{ downloading.name }}</Text>
        <Progress
          :value="downloading.percent"
          size="sm"
          :aria-label="`${downloading.name}下载进度`"
          class="flex-1"
        />
        <Text size="xs" tone="muted" class="shrink-0 tabular-nums">
          {{ downloading.percent }}%
        </Text>
      </template>
      <Text v-else-if="missing.length" size="xs" tone="muted">首次使用需下载：{{ sizes }}</Text>
    </Inline>
  </Stack>
</template>

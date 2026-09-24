<script setup lang="ts">
  import { Button, Combobox, Inline, Stack, Text } from '@hina-ui/vue'
  import { useDeskSize } from '~/features/contribute/useDeskSize'
  import type { IntakeSuggestion, IntakeVolume } from '~/features/contribute/useNovelIntake'
  import { useVolumeSearch } from '~/features/contribute/useVolumeSearch'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  const props = defineProps<{ filename: string; suggestion: IntakeSuggestion | null }>()
  const emit = defineEmits<{ pick: [volume: IntakeVolume] }>()

  const { control, field, caption } = useDeskSize()
  const { search, results, loading } = useVolumeSearch()
  const label = (volume: IntakeVolume) =>
    `${volume.series.name_cn || volume.series.name} ${getLightNovelVolumeLabel(volume) ?? getLightNovelVolumeTitle(volume)}`
  const options = computed(() =>
    results.value.map(volume => ({
      value: volume.id,
      label: volume.has_epub ? `${label(volume)}（本站已收录）` : label(volume),
      disabled: volume.has_epub,
    })),
  )

  function choose(id: string | number | null | undefined) {
    const volume =
      id === 'suggestion' ? props.suggestion : results.value.find(item => item.id === id)
    if (volume && !volume.has_epub) emit('pick', volume)
  }
</script>

<template>
  <Stack gap="xs">
    <Inline v-if="suggestion" align="center" justify="between" gap="sm" :wrap="false">
      <Text :size="caption" tone="muted" class="min-w-0">
        可能为「{{ label(suggestion) }}」{{ suggestion.has_epub ? '，本站已收录此卷' : '' }}
      </Text>
      <Button
        v-if="!suggestion.has_epub"
        :size="control"
        variant="soft"
        tone="neutral"
        class="shrink-0"
        @click="choose('suggestion')"
      >
        确认
      </Button>
    </Inline>
    <Combobox
      v-model:search="search"
      :model-value="null"
      :options="options"
      :loading="loading"
      :size="field"
      ignore-filter
      placeholder="搜索书名，或输入卷、系列 ID"
      :aria-label="`${filename} 对应的卷`"
      @update:model-value="choose"
    />
  </Stack>
</template>

<script setup lang="ts">
  import { Center, Inline, Stack, Text } from '@hina-ui/vue'
  import { BookOpen } from '@lucide/vue'
  import type { IntakeVolume } from '~/features/contribute/useNovelIntake'
  import { getLightNovelVolumeLabel, getLightNovelVolumeTitle } from '~/utils/media/light-novel'

  const props = defineProps<{ volume: IntakeVolume; large?: boolean }>()

  const series = computed(() => props.volume.series.name_cn?.trim() || props.volume.series.name)
  const title = computed(() => {
    const label = getLightNovelVolumeLabel(props.volume)
    const name = getLightNovelVolumeTitle(props.volume)
    return label && name !== label && name !== series.value ? `${label} · ${name}` : (label ?? name)
  })
  const cover = computed(() => cn('shrink-0 rounded-xs', props.large ? 'h-14 w-10' : 'h-12 w-9'))
</script>

<template>
  <Inline gap="sm" align="center" :wrap="false" class="min-w-0">
    <HikariImage
      :src="volume.covers[0]?.media.src ?? null"
      :alt="series"
      preset="small"
      :class="cover"
      image-class="object-cover"
    >
      <template #empty>
        <Center :class="cn(cover, 'bg-subtle text-muted')">
          <BookOpen class="size-4" aria-hidden="true" />
        </Center>
      </template>
      <template #error>
        <Center :class="cn(cover, 'bg-subtle text-muted')">
          <BookOpen class="size-4" aria-hidden="true" />
        </Center>
      </template>
    </HikariImage>
    <Stack gap="none" class="min-w-0">
      <Text :size="large ? 'base' : 'sm'" weight="medium" truncate>{{ series }}</Text>
      <Text :size="large ? 'sm' : 'xs'" tone="muted" truncate>{{ title }}</Text>
    </Stack>
  </Inline>
</template>

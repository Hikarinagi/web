<script setup lang="ts">
  import { FormField, Select } from '@hina-ui/vue'
  import type {
    MangaTarget,
    MangaTargetChapter,
    MangaTargetClaim,
    MangaTargetVolume,
  } from '~/features/contribute/manga-target'
  import { useVolumeTarget } from '~/features/contribute/useVolumeTarget'
  import type { CreateMangaProjectValues } from '~/features/workbench/manga/schemas/manga.schema'

  const props = defineProps<{
    series: MangaTarget
    mode: CreateMangaProjectValues['mode']
    fixed: boolean
    volumes: MangaTargetVolume[]
    chapters: MangaTargetChapter[]
    claims: MangaTargetClaim[]
    published: MangaTargetClaim[]
  }>()
  const volumeId = defineModel<number | null | undefined>('volumeId', { required: true })
  const part = defineModel<number | null | undefined>('part', { required: true })
  const count = defineModel<number | null | undefined>('count', { required: true })

  const { createOpen, choices, nextNumber, model, replaced, onCreated } = useVolumeTarget({
    volumes: toRef(props, 'volumes'),
    chapters: toRef(props, 'chapters'),
    claims: toRef(props, 'claims'),
    published: toRef(props, 'published'),
    values: reactive({ volume_id: volumeId, mode: computed(() => props.mode) }),
    fixed: () => props.fixed,
  })
  const volume = computed(() => props.volumes.find(item => item.id === volumeId.value))
</script>

<template>
  <FormField
    v-if="!fixed"
    name="volume_id"
    label="单行本"
    required
    :description="
      replaced === null || part != null
        ? undefined
        : `已收录：${replaced} 页。审核通过后，你上传的版本将替换现有版本。`
    "
  >
    <Select v-model="model" :options="choices" placeholder="选择单行本" />
  </FormField>
  <ContributeMangaPartField
    v-model:part="part"
    v-model:count="count"
    :volume="volume"
    :claims="claims"
    :published="published"
  />
  <ContributeMangaVolumeCreateDialog
    v-model:open="createOpen"
    :series="series"
    :volume-number="nextNumber"
    :volumes="volumes"
    @created="onCreated"
  />
</template>

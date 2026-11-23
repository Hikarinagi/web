<script setup lang="ts">
  import { FormField, Select } from '@hina-ui/vue'
  import type {
    MangaTarget,
    MangaTargetChapter,
    MangaTargetClaim,
    MangaTargetSet,
    MangaTargetVolume,
  } from '~/features/contribute/manga-target'
  import { useVolumeTarget } from '~/features/contribute/useVolumeTarget'
  import type { CreateMangaProjectValues } from '~/features/workbench/manga/schemas/manga.schema'

  const props = defineProps<{
    series: MangaTarget
    mode: CreateMangaProjectValues['mode']
    fixed: boolean
    sets: MangaTargetSet[]
    volumes: MangaTargetVolume[]
    chapters: MangaTargetChapter[]
    claims: MangaTargetClaim[]
    published: MangaTargetClaim[]
  }>()
  const setId = defineModel<number | null>('setId', { required: true })
  const volumeId = defineModel<number | null | undefined>('volumeId', { required: true })

  const { createOpen, choices, nextNumber, model, replaced, onCreated } = useVolumeTarget({
    volumes: toRef(props, 'volumes'),
    chapters: toRef(props, 'chapters'),
    claims: toRef(props, 'claims'),
    published: toRef(props, 'published'),
    values: reactive({ volume_id: volumeId, mode: computed(() => props.mode) }),
    fixed: () => props.fixed,
  })
</script>

<template>
  <ContributeMangaSetField v-if="!fixed" v-model="setId" :sets="sets" />
  <FormField
    v-if="!fixed"
    name="volume_id"
    label="单行本"
    required
    :description="
      replaced === null
        ? undefined
        : `已收录 ${replaced} 页。审核通过后，你上传的版本将替换现有版本。`
    "
  >
    <Select v-model="model" :options="choices" placeholder="选择单行本" />
  </FormField>
  <ContributeMangaVolumeCreateDialog
    v-model:open="createOpen"
    :series="series"
    :set-id="setId"
    :volume-number="nextNumber"
    :volumes="volumes"
    @created="onCreated"
  />
</template>

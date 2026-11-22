<script setup lang="ts">
  import { AspectRatio, FileUpload, Inline, Select, Stack, Tag, Text } from '@hina-ui/vue'
  import { IMAGE_TYPES, uploadImage } from '~/components/media-library/lib/upload'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { mediaDraft } from '~/features/wiki/editor/inputs'
  import { RATING_LABELS } from '~/utils/media/image'

  defineOptions({ name: 'WikiFieldImage' })

  const props = defineProps<{
    label: string
    rating: { sexual: number | null; violence: number | null }
    card?: boolean
    ratio?: number
    contain?: boolean
    trim?: boolean
  }>()
  const emit = defineEmits<{ rate: [rating: { sexual: number; violence: number }] }>()
  const model = defineModel<ValueDraft>({ required: true })

  const uploading = ref(false)
  const sexualLevels = RATING_LABELS.sexual.map((label, value) => ({ value, label }))
  const violenceLevels = RATING_LABELS.violence.map((label, value) => ({ value, label }))

  async function upload(files: File | File[] | null) {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return
    uploading.value = true
    try {
      const media = await uploadImage(file, { trim: props.trim })
      if (media) model.value = { ...model.value, media: mediaDraft(media) }
    } finally {
      uploading.value = false
    }
  }

  function rate(field: 'sexual' | 'violence', value: string | number | null | undefined) {
    if (value === null || value === undefined) return
    emit('rate', {
      sexual: props.rating.sexual ?? 0,
      violence: props.rating.violence ?? 0,
      [field]: Number(value),
    })
  }
</script>

<template>
  <Stack v-if="card" gap="sm">
    <AspectRatio :ratio="ratio ?? 3 / 4" class="relative overflow-hidden rounded-sm bg-inset">
      <HikariImage
        v-if="model.media"
        :src="model.media"
        :alt="label"
        preset="small"
        preview
        :spoiler="false"
        class="size-full"
        :image-class="contain ? 'size-full object-contain p-2' : 'size-full object-cover'"
      />
      <Tag v-if="!model.is_public" tone="warning" size="sm" class="absolute top-1 left-1">
        未公开
      </Tag>
    </AspectRatio>
    <Inline gap="xs" align="end" :wrap="false">
      <Stack gap="none" class="min-w-0 flex-1">
        <Text size="xs" tone="muted">成人内容</Text>
        <Select
          :model-value="rating.sexual"
          :options="sexualLevels"
          size="sm"
          placeholder="未分级"
          aria-label="成人内容"
          @update:model-value="value => rate('sexual', value)"
        />
      </Stack>
      <Stack gap="none" class="min-w-0 flex-1">
        <Text size="xs" tone="muted">血腥暴力</Text>
        <Select
          :model-value="rating.violence"
          :options="violenceLevels"
          size="sm"
          placeholder="未分级"
          aria-label="血腥暴力"
          @update:model-value="value => rate('violence', value)"
        />
      </Stack>
      <slot name="menu" />
    </Inline>
  </Stack>
  <Inline v-else gap="md" align="start">
    <HikariImage
      v-if="model.media"
      :src="model.media"
      :alt="label"
      preset="small"
      preview
      :spoiler="false"
      class="size-24 shrink-0 overflow-hidden rounded-md"
      image-class="size-full object-cover"
    />
    <Stack gap="sm" class="min-w-0">
      <FileUpload
        variant="button"
        :accept="IMAGE_TYPES.join(',')"
        :loading="uploading"
        :list="false"
        @update:model-value="upload"
      >
        {{ model.media ? '换一张' : '上传图片' }}
      </FileUpload>
      <Inline v-if="model.media" gap="sm" align="center">
        <Text as="span" size="sm" tone="muted">成人内容</Text>
        <Select
          :model-value="rating.sexual"
          :options="sexualLevels"
          aria-label="成人内容"
          placeholder="未分级"
          class="w-28"
          @update:model-value="value => rate('sexual', value)"
        />
        <Text as="span" size="sm" tone="muted">血腥暴力</Text>
        <Select
          :model-value="rating.violence"
          :options="violenceLevels"
          aria-label="血腥暴力"
          placeholder="未分级"
          class="w-28"
          @update:model-value="value => rate('violence', value)"
        />
      </Inline>
    </Stack>
  </Inline>
</template>

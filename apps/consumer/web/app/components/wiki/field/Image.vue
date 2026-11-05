<script setup lang="ts">
  import { FileUpload, Inline, Select, Stack } from '@hina-ui/vue'
  import { uploadImage } from '~/components/media-library/lib/upload'
  import type { ValueDraft } from '~/features/wiki/editor/draft'
  import { SEXUAL_LEVELS, VIOLENCE_LEVELS } from '~/features/wiki/editor/inputs'

  defineOptions({ name: 'WikiFieldImage' })

  const props = defineProps<{
    label: string
    rating: { sexual: number | null; violence: number | null }
  }>()
  const emit = defineEmits<{ rate: [rating: { sexual: number; violence: number }] }>()
  const model = defineModel<ValueDraft>({ required: true })

  const uploading = ref(false)
  const levels = (names: readonly string[]) =>
    names.map((label, value) => ({ value, label: `${value} 级：${label}` }))

  async function upload(files: File | File[] | null) {
    const file = Array.isArray(files) ? files[0] : files
    if (!file) return
    uploading.value = true
    try {
      const media = await uploadImage(file)
      if (media)
        model.value = {
          ...model.value,
          media: {
            id: media.id,
            src: media.src,
            width: media.width ?? null,
            height: media.height ?? null,
            thumb_hash: media.thumb_hash ?? null,
            sexual: null,
            violence: null,
          },
        }
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
  <Inline gap="md" align="start">
    <HikariImage
      v-if="model.media"
      :src="model.media"
      :alt="label"
      preset="small"
      preview
      class="size-24 shrink-0 overflow-hidden rounded-md"
      image-class="size-full object-cover"
    />
    <Stack gap="sm" class="min-w-0">
      <FileUpload
        variant="button"
        accept="image/jpeg,image/png,image/webp,image/gif"
        :loading="uploading"
        :list="false"
        @update:model-value="upload"
      >
        {{ model.media ? '换一张' : '上传图片' }}
      </FileUpload>
      <Inline v-if="model.media" gap="sm" align="center">
        <Select
          :model-value="rating.sexual"
          :options="levels(SEXUAL_LEVELS)"
          aria-label="性分级"
          placeholder="性分级"
          class="w-36"
          @update:model-value="value => rate('sexual', value)"
        />
        <Select
          :model-value="rating.violence"
          :options="levels(VIOLENCE_LEVELS)"
          aria-label="暴力分级"
          placeholder="暴力分级"
          class="w-36"
          @update:model-value="value => rate('violence', value)"
        />
      </Inline>
    </Stack>
  </Inline>
</template>

<script setup lang="ts">
  import { FileUpload, FormField, IconButton, Inline, Stack, Text } from '@hina-ui/vue'
  import { Upload, X } from '@lucide/vue'
  import type { MediaValue } from '~/components/media-library/types'

  defineOptions({ name: 'CreatorEntryImagesUpload' })
  defineProps<{
    uploads: { media: MediaValue; name: string }[]
    uploading: boolean
    single: boolean
    proof: boolean
  }>()
  const proofs = defineModel<{ media: MediaValue; name: string }[]>('proofs', { required: true })
  const emit = defineEmits<{ upload: [files: File[], proof: boolean] }>()

  function picked(value: File | File[] | null, proof: boolean) {
    const files = Array.isArray(value) ? value : value ? [value] : []
    if (files.length) emit('upload', files, proof)
  }
</script>

<template>
  <Stack gap="md">
    <Stack gap="sm">
      <Text v-for="item in uploads" :key="item.media.id" as="span" size="sm">
        {{ item.name }}
      </Text>
      <FileUpload
        :model-value="null"
        :multiple="!single"
        :list="false"
        :loading="uploading"
        accept="image/jpeg,image/png,image/webp,image/gif"
        @update:model-value="value => picked(value, false)"
      >
        <template #icon><Upload /></template>
        拖拽文件到此处，或点击选择
      </FileUpload>
    </Stack>
    <FormField v-if="proof" name="proofs">
      <template #label>
        包装上 JAN 或品番的照片
        <Question title="包装上 JAN 或品番的照片" aria-label="查看包装照片的说明">
          上传实物包装正面的扫描或照片作封面时，附上拍到这个版本包装上 JAN
          或品番的照片，这张封面才算有来源。
        </Question>
      </template>
      <Stack gap="sm">
        <Inline
          v-for="item in proofs"
          :key="item.media.id"
          gap="md"
          align="center"
          :wrap="false"
          class="rounded-md border border-line px-3 py-2"
        >
          <HikariImage
            :src="item.media"
            alt=""
            preset="small"
            class="h-9 w-16 shrink-0 overflow-hidden rounded-sm"
            image-class="size-full object-cover"
          />
          <Text as="span" size="sm" truncate class="min-w-0 flex-1">{{ item.name }}</Text>
          <IconButton
            :label="`移除 ${item.name}`"
            variant="ghost"
            tone="neutral"
            size="sm"
            @click="proofs = proofs.filter(other => other.media.id !== item.media.id)"
          >
            <X />
          </IconButton>
        </Inline>
        <FileUpload
          :model-value="null"
          multiple
          :list="false"
          :loading="uploading"
          accept="image/jpeg,image/png,image/webp,image/gif"
          @update:model-value="value => picked(value, true)"
        >
          <template #icon><Upload /></template>
          拖拽文件到此处，或点击选择
        </FileUpload>
      </Stack>
    </FormField>
  </Stack>
</template>

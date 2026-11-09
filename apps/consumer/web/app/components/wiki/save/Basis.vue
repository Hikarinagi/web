<script setup lang="ts">
  import { CloseButton, FileUpload, Inline, Input, Stack } from '@hina-ui/vue'
  import { ImagePlus } from '@lucide/vue'
  import { uploadImage } from '~/components/media-library/lib/upload'
  import { ENTRY_EDITOR } from '~/features/wiki/composables/useEntryEditor'

  defineOptions({ name: 'WikiSaveBasis' })

  const editor = inject(ENTRY_EDITOR)!
  const basis = computed(() => editor.draft.value.basis)
  const uploading = ref(false)

  async function upload(files: File | File[] | null) {
    const list = Array.isArray(files) ? files : files ? [files] : []
    if (!list.length) return
    uploading.value = true
    try {
      const media = []
      for (const file of list) {
        const uploaded = await uploadImage(file)
        if (uploaded)
          media.push({
            id: uploaded.id,
            src: uploaded.src,
            width: uploaded.width ?? null,
            height: uploaded.height ?? null,
            thumb_hash: uploaded.thumb_hash ?? null,
            sexual: null,
            violence: null,
          })
      }
      editor.basis({ ...basis.value, media: [...basis.value.media, ...media] })
    } finally {
      uploading.value = false
    }
  }
</script>

<template>
  <Stack gap="xs">
    <Inline gap="sm" align="center" :wrap="false">
      <Input
        :model-value="basis.url"
        type="url"
        inputmode="url"
        placeholder="依据的网址"
        aria-label="依据的网址"
        class="min-w-0 flex-1"
        @update:model-value="value => editor.basis({ ...basis, url: String(value) })"
      />
      <WikiFieldRule label="依据" :clauses="['A.13.8', 'A.2.1.6']" />
    </Inline>
    <Inline gap="sm" align="center">
      <Inline
        v-for="(media, index) in basis.media"
        :key="media.id"
        gap="none"
        align="start"
        :wrap="false"
      >
        <HikariImage
          :src="media"
          :alt="`截图 ${index + 1}`"
          preset="small"
          preview
          class="size-16 overflow-hidden rounded-md"
          image-class="size-full object-cover"
        />
        <CloseButton
          size="xs"
          :label="`去掉截图 ${index + 1}`"
          @click="
            editor.basis({ ...basis, media: basis.media.filter(item => item.id !== media.id) })
          "
        />
      </Inline>
      <FileUpload
        v-if="basis.media.length < 20"
        variant="button"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        :loading="uploading"
        :list="false"
        @update:model-value="upload"
      >
        <template #icon><ImagePlus /></template>
        添加截图
      </FileUpload>
    </Inline>
  </Stack>
</template>

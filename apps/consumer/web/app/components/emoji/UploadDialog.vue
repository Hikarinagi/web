<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { ImagePlus, X } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { EMOJI_MAX_FILE_BYTES } from '~/features/emoji/constants'
  import {
    emojiReplaceImageResolver,
    emojiUploadResolver,
    type EmojiUploadValues,
  } from '~/features/emoji/schemas/emoji-upload.schema'

  type CreatedEmoji = ApiData<'/api/v3/emoji/sets/{id}/emojis', 'post'>
  type ReplacedEmoji = ApiData<'/api/v3/emoji/sets/{setId}/emojis/{emojiId}/src', 'put'>
  type DoneEmoji = CreatedEmoji | ReplacedEmoji

  defineOptions({ name: 'EmojiUploadDialog' })

  const open = defineModel<boolean>('open', { required: true })
  const props = defineProps<{
    setId: number
    setName: string
    emoji?: { id: number; name: string } | null
  }>()
  const emit = defineEmits<{ done: [emoji: DoneEmoji] }>()

  const isReplace = computed(() => !!props.emoji)
  const header = computed(() =>
    props.emoji ? `替换图片:${props.emoji.name}` : `上传贴纸到 ${props.setName}`,
  )
  const fileLabel = computed(() => (isReplace.value ? '新图片' : '图片文件'))
  const submitLabel = computed(() => (isReplace.value ? '替换' : '上传'))

  const formErrors = useFormErrors(
    isReplace.value ? emojiReplaceImageResolver : emojiUploadResolver,
  )
  const form = useTemplateRef<FormInstance>('form')
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
  const submitting = ref(false)
  const filePreview = useFilePreview(fileInput)

  watch(open, next => {
    if (next) {
      formErrors.clear()
      form.value?.reset()
    }
    filePreview.revoke()
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    submitting.value = true
    try {
      const file = (event.values as { file: File }).file
      const body = new FormData()
      body.append('file', file)
      let result: DoneEmoji
      if (props.emoji) {
        result = await hikariRequest('/api/v3/emoji/sets/{setId}/emojis/{emojiId}/src', {
          method: 'put',
          path: { setId: props.setId, emojiId: props.emoji.id },
          body,
        })
      } else {
        body.append('name', (event.values as EmojiUploadValues).name)
        result = await hikariRequest('/api/v3/emoji/sets/{id}/emojis', {
          method: 'post',
          path: { id: props.setId },
          body,
        })
      }
      open.value = false
      emit('done', result)
    } catch (error) {
      await formErrors.apply(error, form.value)
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:visible="open"
    modal
    :header="header"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '28rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem v-slot="{ field }" name="file" :label="fileLabel" required>
        <input
          ref="fileInput"
          type="file"
          accept="image/webp,image/png,image/jpeg,image/gif"
          class="hidden"
          @change="event => filePreview.onChange(value => field.props.onInput({ value }), event)"
        />
        <div
          v-if="!filePreview.previewUrl.value"
          class="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-200 py-8 dark:border-surface-700"
          @click="filePreview.open"
        >
          <ImagePlus class="size-8 text-muted-color" />
          <Button
            label="选择图片"
            severity="secondary"
            size="small"
            @click="
              e => {
                filePreview.open()
                e.stopPropagation()
              }
            "
          />
          <p class="text-xs text-muted-color">
            支持 WebP / PNG / JPEG / GIF,最大 {{ Math.round(EMOJI_MAX_FILE_BYTES / 1024) }} KB
          </p>
        </div>
        <div
          v-else
          class="flex items-center gap-3 rounded-lg p-3 ring-1 ring-surface-200 dark:ring-surface-700"
        >
          <HikariImage
            :src="filePreview.previewUrl.value"
            alt="预览"
            class="size-16 rounded"
            image-class="object-contain"
          />
          <div class="flex grow flex-col gap-1 text-xs">
            <p class="font-medium">{{ (field.value as File | null)?.name }}</p>
            <p class="text-muted-color">
              {{ Math.round(((field.value as File | null)?.size ?? 0) / 1024) }} KB
            </p>
          </div>
          <Button
            severity="secondary"
            variant="text"
            size="small"
            rounded
            @click="filePreview.onClear(value => field.props.onInput({ value }))"
          >
            <template #icon>
              <X class="size-4" />
            </template>
          </Button>
        </div>
      </FormItem>

      <FormItem v-if="!isReplace" v-slot="{ id }" name="name" label="名称" required>
        <InputText :id="id" autocomplete="off" fluid placeholder="描述这个贴纸, 会显示为 :name:" />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="open = false" />
        <Button :label="submitLabel" type="submit" :loading="submitting" />
      </div>
    </Form>
  </Dialog>
</template>

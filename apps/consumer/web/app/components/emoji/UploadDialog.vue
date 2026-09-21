<script setup lang="ts">
  import { Button, Dialog, FileUpload, Form, FormField, Input } from '@hina-ui/vue'
  import { ImagePlus } from '@lucide/vue'
  import type { ApiData } from '@hikarinagi/api-contract/v3'
  import { EMOJI_MAX_FILE_BYTES } from '~/features/emoji/constants'
  import {
    emojiReplaceImageSchema,
    emojiUploadSchema,
  } from '~/features/emoji/schemas/emoji-upload.schema'
  import { getFieldErrors } from '~/utils/api/error'

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
    props.emoji ? `替换图片：${props.emoji.name}` : `上传贴纸到 ${props.setName}`,
  )
  const fileLabel = computed(() => (isReplace.value ? '新图片' : '图片文件'))
  const submitLabel = computed(() => (isReplace.value ? '替换' : '上传'))
  const schema = computed(() => (isReplace.value ? emojiReplaceImageSchema : emojiUploadSchema))

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ file: File | null; name: string }>({ file: null, name: '' })

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.file = null
    values.name = ''
  })

  async function onSubmit() {
    if (submitting.value || !values.file) return
    submitting.value = true
    try {
      const body = new FormData()
      body.append('file', values.file)
      let result: DoneEmoji
      if (props.emoji) {
        result = await hikariRequest('/api/v3/emoji/sets/{setId}/emojis/{emojiId}/src', {
          method: 'put',
          path: { setId: props.setId, emojiId: props.emoji.id },
          body,
        })
      } else {
        body.append('name', values.name.trim())
        result = await hikariRequest('/api/v3/emoji/sets/{id}/emojis', {
          method: 'post',
          path: { id: props.setId },
          body,
        })
      }
      open.value = false
      emit('done', result)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" size="md" :title="header" :locked="submitting">
    <template #content>
      <Form ref="form" :values="values" :rules="schema" :disabled="submitting" @submit="onSubmit">
        <FormField
          name="file"
          :label="fileLabel"
          required
          :description="`支持 WebP / PNG / JPEG / GIF，最大 ${Math.round(EMOJI_MAX_FILE_BYTES / 1024)} KB`"
        >
          <FileUpload
            v-model="values.file"
            accept="image/webp,image/png,image/jpeg,image/gif"
            :max-size="EMOJI_MAX_FILE_BYTES"
          >
            <template #icon><ImagePlus /></template>
            选择或拖入图片
          </FileUpload>
        </FormField>

        <FormField v-if="!isReplace" name="name" label="名称" required>
          <Input
            v-model="values.name"
            autocomplete="off"
            placeholder="描述这个贴纸，会显示为 :name:"
          />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button :loading="submitting" @click="form?.submit()">{{ submitLabel }}</Button>
    </template>
  </Dialog>
</template>

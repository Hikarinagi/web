<script setup lang="ts">
  import {
    Button,
    Card,
    Dialog,
    Form,
    FormField,
    IconButton,
    Inline,
    Input,
    Stack,
    Text,
  } from '@hina-ui/vue'
  import { ImagePlus, X } from '@lucide/vue'
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
  const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
  const submitting = ref(false)
  const filePreview = useFilePreview(fileInput)
  const values = reactive<{ file: File | null; name: string }>({ file: null, name: '' })

  function setFile(file: File | null) {
    values.file = file
  }

  watch(open, next => {
    if (next) {
      form.value?.reset()
      values.file = null
      values.name = ''
    }
    filePreview.revoke()
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
        <FormField name="file" :label="fileLabel" required>
          <input
            ref="fileInput"
            type="file"
            accept="image/webp,image/png,image/jpeg,image/gif"
            class="hidden"
            @change="event => filePreview.onChange(setFile, event)"
          />

          <Card
            v-if="!filePreview.previewUrl.value"
            as="button"
            type="button"
            class="hn-state-layer w-full hn-interactive border-dashed"
            @click="filePreview.open()"
          >
            <Stack align="center" gap="sm">
              <ImagePlus class="size-8 text-muted" />
              <Text size="sm" weight="medium">选择图片</Text>
              <Text size="xs" tone="muted">
                支持 WebP / PNG / JPEG / GIF，最大 {{ Math.round(EMOJI_MAX_FILE_BYTES / 1024) }} KB
              </Text>
            </Stack>
          </Card>

          <Card v-else :padded="false">
            <Inline gap="sm" align="center" :wrap="false" class="p-3">
              <HikariImage
                :src="filePreview.previewUrl.value"
                alt="预览"
                class="size-16 rounded"
                image-class="object-contain"
              />
              <Stack gap="xs" class="min-w-0 flex-1">
                <Text size="xs" weight="medium" truncate>{{ values.file?.name }}</Text>
                <Text size="xs" tone="muted">
                  {{ Math.round((values.file?.size ?? 0) / 1024) }} KB
                </Text>
              </Stack>
              <IconButton
                label="移除图片"
                variant="ghost"
                tone="neutral"
                size="sm"
                pill
                @click="filePreview.onClear(setFile)"
              >
                <X />
              </IconButton>
            </Inline>
          </Card>
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

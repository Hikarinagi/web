<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Inline, Input, Select } from '@hina-ui/vue'
  import { useDebounceFn } from '@vueuse/core'
  import { Check, X } from '@lucide/vue'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'
  import { EMOJI_SET_NAME_REGEX, EMOJI_VISIBILITY_OPTIONS } from '~/features/emoji/constants'
  import { setCreateSchema } from '~/features/emoji/schemas/set-create.schema'
  import { getFieldErrors } from '~/utils/api/error'

  defineOptions({ name: 'EmojiSetCreateDialog' })

  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ created: [set: MyEmojiSet] }>()

  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const submitting = ref(false)
  const values = reactive<{ name: string; visibility: string | number | null }>({
    name: '',
    visibility: null,
  })

  const nameStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const nameStatusTooltip = computed(() =>
    nameStatus.value === 'available' ? '名称可用' : '该名称已被占用或被软删保留',
  )

  const checkAvailable = useDebounceFn(async (name: string) => {
    if (!name || !EMOJI_SET_NAME_REGEX.test(name)) {
      nameStatus.value = 'idle'
      return
    }
    nameStatus.value = 'checking'
    try {
      const res = await hikariRequest<'/api/v3/emoji/sets/name-available', 'get'>(
        '/api/v3/emoji/sets/name-available',
        { method: 'get', query: { name }, toast: false },
      )
      nameStatus.value = res.available ? 'available' : 'taken'
    } catch {
      nameStatus.value = 'idle'
    }
  }, 300)

  watch(
    () => values.name,
    value => {
      void checkAvailable(value)
    },
  )

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.name = ''
    values.visibility = null
    nameStatus.value = 'idle'
  })

  async function onSubmit() {
    if (submitting.value || nameStatus.value === 'taken') return
    submitting.value = true
    try {
      const created = await hikariRequest<'/api/v3/emoji/sets', 'post'>('/api/v3/emoji/sets', {
        method: 'post',
        body: {
          name: values.name.trim(),
          visibility: values.visibility as 'PUBLIC' | 'PRIVATE',
        },
      })
      open.value = false
      emit('created', created)
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog v-model:open="open" size="lg" title="新建贴纸包" :locked="submitting">
    <template #content>
      <Form
        ref="form"
        :values="values"
        :rules="setCreateSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="name"
          label="名称"
          description="名称一经创建不可修改，删除后也无法被任何人重新使用"
          required
        >
          <Input
            v-model="values.name"
            autocomplete="off"
            :loading="nameStatus === 'checking'"
            placeholder="2-16 字符，字母/数字/下划线/连字符"
          >
            <template v-if="nameStatus === 'available' || nameStatus === 'taken'" #trailing>
              <Inline v-tooltip="nameStatusTooltip" as="span" gap="none">
                <Check v-if="nameStatus === 'available'" class="size-4 text-success-text" />
                <X v-else class="size-4 text-danger-text" />
              </Inline>
            </template>
          </Input>
        </FormField>

        <FormField name="visibility" label="可见性" required>
          <Select
            v-model="values.visibility"
            :options="EMOJI_VISIBILITY_OPTIONS"
            placeholder="请选择"
          />
        </FormField>
      </Form>
    </template>

    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        取消
      </Button>
      <Button
        :loading="submitting"
        :disabled="nameStatus === 'taken' || nameStatus === 'checking'"
        @click="form?.submit()"
      >
        创建
      </Button>
    </template>
  </Dialog>
</template>

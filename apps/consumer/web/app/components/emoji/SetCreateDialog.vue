<script setup lang="ts">
  import Form, { type FormInstance, type FormSubmitEvent } from '@primevue/forms/form'
  import { useDebounceFn } from '@vueuse/core'
  import { Check, Loader2, X } from '@lucide/vue'
  import type { MyEmojiSet } from '~/features/emoji/composables/useMySets'
  import { EMOJI_SET_NAME_REGEX, EMOJI_VISIBILITY_OPTIONS } from '~/features/emoji/constants'
  import {
    setCreateResolver,
    type SetCreateValues,
  } from '~/features/emoji/schemas/set-create.schema'

  defineOptions({ name: 'EmojiSetCreateDialog' })

  const open = defineModel<boolean>('open', { required: true })
  const emit = defineEmits<{ created: [set: MyEmojiSet] }>()

  const formErrors = useFormErrors(setCreateResolver)
  const form = useTemplateRef<FormInstance>('form')
  const submitting = ref(false)

  const nameInput = ref('')
  const nameStatus = ref<'idle' | 'checking' | 'available' | 'taken'>('idle')
  const nameStatusTooltip = computed(() => {
    switch (nameStatus.value) {
      case 'checking':
        return '检查中...'
      case 'available':
        return '名称可用'
      case 'taken':
        return '该名称已被占用或被软删保留'
      default:
        return ''
    }
  })

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

  watch(nameInput, value => {
    void checkAvailable(value)
  })

  watch(open, next => {
    if (next) {
      formErrors.clear()
      form.value?.reset()
      nameInput.value = ''
      nameStatus.value = 'idle'
    }
  })

  async function onSubmit(event: FormSubmitEvent) {
    if (!event.valid || submitting.value) return
    if (nameStatus.value === 'taken') return
    submitting.value = true
    try {
      const values = event.values as SetCreateValues
      const created = await hikariRequest<'/api/v3/emoji/sets', 'post'>('/api/v3/emoji/sets', {
        method: 'post',
        body: { name: values.name, visibility: values.visibility },
      })
      open.value = false
      emit('created', created)
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
    header="新建贴纸包"
    :dismissable-mask="!submitting"
    :close-on-escape="!submitting"
    :style="{ width: '92vw', maxWidth: '32rem' }"
  >
    <Form
      ref="form"
      :resolver="formErrors.resolver"
      class="flex flex-col gap-4"
      @input="formErrors.clear"
      @submit="onSubmit"
    >
      <FormItem
        v-slot="{ id }"
        name="name"
        label="名称"
        description="名称一经创建不可修改,删除后也无法被任何人重新使用"
        required
      >
        <IconField>
          <InputText
            :id="id"
            v-model="nameInput"
            autocomplete="off"
            fluid
            placeholder="2-16 字符,字母/数字/下划线/连字符"
          />
          <InputIcon v-if="nameStatus !== 'idle'" v-tooltip.top="nameStatusTooltip">
            <Loader2
              v-if="nameStatus === 'checking'"
              class="size-4 animate-spin text-muted-color"
            />
            <Check
              v-else-if="nameStatus === 'available'"
              class="size-4 text-green-600 dark:text-green-400"
            />
            <X v-else class="size-4 text-red-500" />
          </InputIcon>
        </IconField>
      </FormItem>

      <FormItem v-slot="{ id }" name="visibility" label="可见性" required>
        <Select
          :input-id="id"
          :options="EMOJI_VISIBILITY_OPTIONS"
          option-label="label"
          option-value="value"
          placeholder="请选择"
          fluid
        />
      </FormItem>

      <div class="flex justify-end gap-3 pt-2">
        <Button label="取消" severity="secondary" :disabled="submitting" @click="open = false" />
        <Button
          label="创建"
          type="submit"
          :loading="submitting"
          :disabled="nameStatus === 'taken' || nameStatus === 'checking'"
        />
      </div>
    </Form>
  </Dialog>
</template>

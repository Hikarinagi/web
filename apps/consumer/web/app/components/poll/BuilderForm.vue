<script setup lang="ts">
  import {
    Button,
    DateTimePicker,
    Form,
    FormField,
    IconButton,
    Input,
    InputGroup,
    NumberInput,
    Stack,
    Switch,
  } from '@hina-ui/vue'
  import { Plus, X } from '@lucide/vue'
  import {
    pollLockedSchema,
    pollSchema,
    type PollValues,
  } from '~/features/interaction/schemas/poll.schema'
  import type { PollEditorDef } from '~/features/interaction/usePollEditor'
  import { TimeFormatEnum, timeFormat } from '~/utils/time-format'

  defineOptions({ name: 'PollBuilderForm' })

  const props = withDefaults(
    defineProps<{ initial?: PollEditorDef | null; locked?: boolean; submitting?: boolean }>(),
    { initial: null, locked: false, submitting: false },
  )
  const emit = defineEmits<{ submit: [PollEditorDef] }>()

  const MAX_OPTIONS = 10

  const values = reactive<PollValues>({
    question: '',
    options: ['', ''],
    allow_multiple: false,
    max_choices: null,
    is_public: false,
    allow_change: true,
    closes_at: null,
  })

  const form = useTemplateRef<InstanceType<typeof Form>>('form')

  onMounted(() => {
    if (!props.initial) return
    values.question = props.initial.question
    values.options = props.initial.options.length ? props.initial.options.slice() : ['', '']
    values.allow_multiple = props.initial.allow_multiple
    values.max_choices = props.initial.max_choices
    values.is_public = !props.initial.anonymous
    values.allow_change = props.initial.allow_change
    values.closes_at = props.initial.closes_at
      ? timeFormat(props.initial.closes_at, TimeFormatEnum.YYYY_MM_DD_HH_MM).replace(' ', 'T')
      : null
  })

  const maxChoicesCap = computed(() =>
    Math.max(2, values.options.filter(option => option.length > 0).length),
  )

  function addOption() {
    if (values.options.length < MAX_OPTIONS) values.options.push('')
  }

  function removeOption(index: number) {
    if (values.options.length > 2) values.options.splice(index, 1)
  }

  function onSubmit() {
    emit('submit', {
      question: values.question.trim(),
      options: values.options.map(option => option.trim()).filter(Boolean),
      allow_multiple: values.allow_multiple,
      max_choices: values.allow_multiple ? values.max_choices : null,
      anonymous: !values.is_public,
      allow_change: values.allow_change,
      closes_at: values.closes_at ? new Date(values.closes_at).toISOString() : null,
    })
  }

  defineExpose({ submit: () => form.value?.submit() })
</script>

<template>
  <Form
    ref="form"
    :values="values"
    :rules="locked ? pollLockedSchema : pollSchema"
    :disabled="submitting"
    @submit="onSubmit"
  >
    <FormField name="question" label="问题">
      <Input v-model="values.question" maxlength="120" placeholder="想问大家什么？" />
    </FormField>

    <FormField
      name="options"
      label="选项"
      description-placement="label"
      :description="locked ? '已经有人投票啦，选项已锁定' : undefined"
    >
      <Stack gap="sm">
        <InputGroup v-for="(_, index) in values.options" :key="index" :disabled="locked">
          <Input
            v-model="values.options[index]"
            :placeholder="`选项 ${index + 1}`"
            maxlength="80"
            @keydown.enter.prevent="index === values.options.length - 1 ? addOption() : undefined"
          />
          <IconButton
            v-if="!locked"
            label="移除选项"
            variant="ghost"
            tone="neutral"
            :disabled="values.options.length <= 2"
            @click="removeOption(index)"
          >
            <X />
          </IconButton>
        </InputGroup>

        <Button
          v-if="!locked && values.options.length < MAX_OPTIONS"
          variant="ghost"
          tone="accent"
          class="self-start"
          @click="addOption"
        >
          <template #icon><Plus /></template>
          添加选项
        </Button>
      </Stack>
    </FormField>

    <Switch v-model="values.allow_multiple" control-placement="end" block :disabled="locked">
      允许多选
    </Switch>

    <FormField v-if="values.allow_multiple" name="max_choices" label="最多可选">
      <NumberInput
        v-model="values.max_choices"
        :min="2"
        :max="maxChoicesCap"
        :disabled="locked"
        placeholder="不限"
      />
    </FormField>

    <Switch
      v-model="values.is_public"
      control-placement="end"
      block
      description="开启后展示参与者头像"
    >
      公开投票人
    </Switch>

    <Switch
      v-model="values.allow_change"
      control-placement="end"
      block
      description="关闭后投票一旦提交不可更改"
    >
      允许修改投票
    </Switch>

    <FormField name="closes_at" label="截止时间（可选）">
      <DateTimePicker
        v-model="values.closes_at"
        clearable
        :hour-cycle="24"
        placeholder="不设置则长期开放"
      />
    </FormField>
  </Form>
</template>

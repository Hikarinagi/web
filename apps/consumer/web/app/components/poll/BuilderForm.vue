<script setup lang="ts">
  import { Plus, X } from '@lucide/vue'
  import type { PollEditorDef } from '~/features/interaction/usePollEditor'

  defineOptions({ name: 'PollBuilderForm' })

  const props = withDefaults(
    defineProps<{ initial?: PollEditorDef | null; locked?: boolean; submitting?: boolean }>(),
    { initial: null, locked: false, submitting: false },
  )
  const emit = defineEmits<{ submit: [PollEditorDef]; cancel: [] }>()

  const MAX_OPTIONS = 10
  const question = ref('')
  const options = ref<string[]>(['', ''])
  const allowMultiple = ref(false)
  const maxChoices = ref<number | null>(null)
  const isPublic = ref(false)
  const allowChange = ref(true)
  const closesAt = ref<Date | null>(null)

  onMounted(() => {
    if (!props.initial) return
    question.value = props.initial.question
    options.value = props.initial.options.length ? props.initial.options.slice() : ['', '']
    allowMultiple.value = props.initial.allow_multiple
    maxChoices.value = props.initial.max_choices
    isPublic.value = !props.initial.anonymous
    allowChange.value = props.initial.allow_change
    closesAt.value = props.initial.closes_at ? new Date(props.initial.closes_at) : null
  })

  const filledOptions = computed(() => options.value.map(o => o.trim()).filter(Boolean))
  const maxChoicesCap = computed(() => Math.max(2, filledOptions.value.length))
  const valid = computed(
    () => question.value.trim().length > 0 && (props.locked || filledOptions.value.length >= 2),
  )

  function addOption() {
    if (options.value.length < MAX_OPTIONS) options.value.push('')
  }
  function removeOption(index: number) {
    if (options.value.length > 2) options.value.splice(index, 1)
  }

  function submit() {
    if (!valid.value || props.submitting) return
    emit('submit', {
      question: question.value.trim(),
      options: filledOptions.value,
      allow_multiple: allowMultiple.value,
      max_choices: allowMultiple.value ? maxChoices.value : null,
      anonymous: !isPublic.value,
      allow_change: allowChange.value,
      closes_at: closesAt.value ? closesAt.value.toISOString() : null,
    })
  }
</script>

<template>
  <div class="flex w-full flex-col gap-4">
    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold tracking-wide text-muted-color uppercase">问题</label>
      <InputText
        v-model="question"
        fluid
        size="small"
        placeholder="想问大家什么？"
        maxlength="120"
      />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold tracking-wide text-muted-color uppercase">选项</label>
      <p v-if="locked" class="text-xs text-muted-color">已经有人投票啦，选项已锁定</p>
      <div v-for="(_, index) in options" :key="index" class="flex items-center gap-2">
        <InputText
          v-model="options[index]"
          fluid
          size="small"
          :disabled="locked"
          :placeholder="`选项 ${index + 1}`"
          maxlength="80"
          @keydown.enter.prevent="index === options.length - 1 ? addOption() : undefined"
        />
        <Button
          v-if="!locked"
          v-tooltip.top="'移除'"
          unstyled
          type="button"
          :disabled="options.length <= 2"
          class="inline-flex size-8 shrink-0 items-center justify-center rounded-md text-muted-color transition-colors hover:bg-emphasis disabled:opacity-40"
          aria-label="移除选项"
          @click="removeOption(index)"
        >
          <X class="size-4" />
        </Button>
      </div>
      <Button
        v-if="!locked && options.length < MAX_OPTIONS"
        unstyled
        type="button"
        class="inline-flex items-center gap-1.5 self-start rounded-md px-2 py-1 text-sm text-primary transition-colors hover:bg-emphasis"
        @click="addOption"
      >
        <Plus class="size-4" />
        添加选项
      </Button>
    </div>

    <div class="flex items-center justify-between">
      <label class="text-sm text-color">允许多选</label>
      <ToggleSwitch v-model="allowMultiple" :disabled="locked" />
    </div>

    <div v-if="allowMultiple" class="flex items-center justify-between gap-3">
      <label class="text-sm text-color">最多可选</label>
      <InputNumber
        v-model="maxChoices"
        :min="2"
        :max="maxChoicesCap"
        :use-grouping="false"
        size="small"
        :disabled="locked"
        placeholder="不限"
        input-class="text-center"
      />
    </div>

    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-col">
        <label class="text-sm text-color">公开投票人</label>
        <span class="text-xs text-muted-color">开启后展示参与者头像</span>
      </div>
      <ToggleSwitch v-model="isPublic" />
    </div>

    <div class="flex items-center justify-between gap-3">
      <div class="flex flex-col">
        <label class="text-sm text-color">允许修改投票</label>
        <span class="text-xs text-muted-color">关闭后投票一旦提交不可更改</span>
      </div>
      <ToggleSwitch v-model="allowChange" />
    </div>

    <div class="flex flex-col gap-2">
      <label class="text-xs font-semibold tracking-wide text-muted-color uppercase">
        截止时间（可选）
      </label>
      <DatePicker
        v-model="closesAt"
        show-time
        hour-format="24"
        size="small"
        show-button-bar
        placeholder="不设置则长期开放"
      />
    </div>

    <div class="flex items-center justify-end gap-2">
      <Button text severity="secondary" size="small" label="取消" @click="emit('cancel')" />
      <Button size="small" label="保存" :disabled="!valid" :loading="submitting" @click="submit" />
    </div>
  </div>
</template>

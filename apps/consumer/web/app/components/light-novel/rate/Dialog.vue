<script setup lang="ts">
  import { PenLine } from '@lucide/vue'
  import {
    Button,
    Checkbox,
    Dialog,
    Form,
    FormField,
    FormLayout,
    Inline,
    NumberInput,
    Space,
    Stack,
    Text,
    Textarea,
  } from '@hina-ui/vue'
  import { useRateForm } from '~/features/light-novel/useRateForm'
  import {
    LIGHT_NOVEL_RATE_DIMENSIONS,
    LIGHT_NOVEL_STATUS_LABEL,
    LIGHT_NOVEL_STATUS_ORDER,
    type LightNovelRate,
    type UpsertLightNovelRateBody,
  } from '~/features/light-novel/rate'

  defineOptions({ name: 'LightNovelRateDialog' })

  const statusOptions = LIGHT_NOVEL_STATUS_ORDER.filter(value => value !== 'PLAN').map(value => ({
    value,
    label: LIGHT_NOVEL_STATUS_LABEL[value],
  }))

  const props = defineProps<{
    lightNovelId: number
    rate: LightNovelRate | null
    workTitle: string
    upsert: (body: UpsertLightNovelRateBody) => Promise<LightNovelRate | null>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const {
    form,
    values,
    rules,
    submitting,
    detailOpen,
    reviewing,
    isEdit,
    title,
    prepare,
    submit,
    save,
    setDimension,
    clearScore,
    removeStatus,
  } = useRateForm({
    rate: () => props.rate,
    workTitle: () => props.workTitle,
    upsert: props.upsert,
    remove: props.remove,
    close: () => {
      visible.value = false
    },
    onReview: saved => {
      visible.value = false
      if (saved?.id != null) {
        void navigateTo({
          path: '/articles/new',
          query: { light_novel_rate_id: saved.id, work_title: props.workTitle },
        })
      }
    },
  })

  watch(visible, next => {
    if (next) void prepare()
  })
</script>

<template>
  <Dialog v-model:open="visible" :title="title" :locked="submitting">
    <template #content>
      <Form ref="form" :values="values" :rules="rules" @submit="submit">
        <FormLayout>
          <WorkRateStatusPills v-model="values.status" :options="statusOptions" />
          <WorkRateScore v-model="values.rate" />

          <FormField name="time_to_finish_hours" label="读了多久">
            <Inline align="center" gap="sm" :wrap="false">
              <NumberInput
                :model-value="values.time_to_finish_hours"
                :min="0"
                :max="9999"
                :step-snapping="false"
                :format-options="{ maximumFractionDigits: 1, useGrouping: false }"
                class="w-40"
                @update:model-value="value => (values.time_to_finish_hours = value ?? null)"
              />
              <Text size="sm" tone="muted">小时</Text>
            </Inline>
          </FormField>

          <FormField name="rate_content" label="短评">
            <Textarea
              v-model="values.rate_content"
              :rows="3"
              autosize
              placeholder="聊聊剧情、文笔、最戳你的桥段…一句话也行"
              class="w-full"
            />
          </FormField>

          <Stack gap="sm">
            <Checkbox v-model="values.is_spoiler">包含剧透</Checkbox>
            <Checkbox v-model="values.status_private">状态仅自己可见</Checkbox>
          </Stack>

          <WorkRateDimensions
            v-model:open="detailOpen"
            :dimensions="LIGHT_NOVEL_RATE_DIMENSIONS"
            :values="values"
            :update="setDimension"
            label-width="w-14"
          />
        </FormLayout>
      </Form>
    </template>

    <template #footer>
      <WorkRateDangerActions
        v-if="isEdit"
        :clear="clearScore"
        :remove="removeStatus"
        :disabled="submitting"
      />
      <Space size="flex" />
      <Button
        variant="ghost"
        tone="neutral"
        :loading="reviewing"
        :disabled="submitting"
        @click="save(true)"
      >
        <template #icon><PenLine /></template>
        写长评
      </Button>
      <Button :loading="submitting && !reviewing" :disabled="submitting" @click="save()">
        更新状态
      </Button>
    </template>
  </Dialog>
</template>

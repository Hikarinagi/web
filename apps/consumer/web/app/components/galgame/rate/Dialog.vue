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
  import { useRateForm } from '~/features/galgame/useRateForm'
  import {
    GALGAME_RATE_DIMENSIONS,
    GALGAME_STATUS_LABEL,
    GALGAME_STATUS_ORDER,
    type GalgameRate,
    type UpsertGalgameRateBody,
  } from '~/features/galgame/rate'

  defineOptions({ name: 'GalgameRateDialog' })

  const statusOptions = GALGAME_STATUS_ORDER.filter(value => value !== 'PLAN').map(value => ({
    value,
    label: GALGAME_STATUS_LABEL[value],
  }))

  const props = defineProps<{
    galgameId: number
    rate: GalgameRate | null
    workTitle: string
    upsert: (body: UpsertGalgameRateBody) => Promise<GalgameRate | null>
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
          query: { galgame_rate_id: saved.id, work_title: props.workTitle },
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

          <FormField name="time_to_finish_hours" label="玩了多久">
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
              placeholder="聊聊剧本、节奏、印象最深的桥段…一句话也行"
              class="w-full"
            />
          </FormField>

          <Stack gap="sm">
            <Checkbox v-model="values.is_spoiler">包含剧透</Checkbox>
            <Checkbox v-model="values.status_private">状态仅自己可见</Checkbox>
          </Stack>

          <WorkRateDimensions
            v-model:open="detailOpen"
            :dimensions="GALGAME_RATE_DIMENSIONS"
            :values="values"
            :update="setDimension"
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

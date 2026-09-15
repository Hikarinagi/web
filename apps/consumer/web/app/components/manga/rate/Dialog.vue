<script setup lang="ts">
  import {
    Button,
    Checkbox,
    Dialog,
    Form,
    FormField,
    FormLayout,
    Space,
    Stack,
    Textarea,
  } from '@hina-ui/vue'
  import { useRateForm } from '~/features/manga/useRateForm'
  import {
    MANGA_STATUS_LABEL,
    MANGA_STATUS_ORDER,
    type MangaRate,
    type UpsertMangaRateBody,
  } from '~/features/manga/rate'

  defineOptions({ name: 'MangaRateDialog' })

  const statusOptions = MANGA_STATUS_ORDER.filter(value => value !== 'PLAN').map(value => ({
    value,
    label: MANGA_STATUS_LABEL[value],
  }))

  const props = defineProps<{
    rate: MangaRate | null
    workTitle: string
    upsert: (body: UpsertMangaRateBody) => Promise<MangaRate | null>
    remove: () => Promise<unknown>
  }>()
  const visible = defineModel<boolean>('visible', { required: true })

  const {
    form,
    values,
    rules,
    submitting,
    isEdit,
    title,
    prepare,
    submit,
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

          <FormField name="rate_content" label="短评">
            <Textarea
              v-model="values.rate_content"
              :rows="3"
              autosize
              placeholder="聊聊剧情、作画、最戳你的桥段…一句话也行"
              class="w-full"
            />
          </FormField>

          <Stack gap="sm">
            <Checkbox v-model="values.is_spoiler">包含剧透</Checkbox>
            <Checkbox v-model="values.status_private">状态仅自己可见</Checkbox>
          </Stack>
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
      <Button :loading="submitting" :disabled="submitting" @click="form?.submit()">更新状态</Button>
    </template>
  </Dialog>
</template>

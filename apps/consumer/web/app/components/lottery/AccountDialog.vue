<script setup lang="ts">
  import { Button, Dialog, Form, FormField, Input, Text, toast } from '@hina-ui/vue'
  import type { BackendLotteryPrize } from '~/features/lottery/lottery'
  import { claimAccountSchema } from '~/features/lottery/schemas/claim.schema'
  import { getFieldErrors } from '~/utils/api/error'

  const props = defineProps<{
    winnerId: number
    prize: BackendLotteryPrize
    initial?: string | null
  }>()
  const emit = defineEmits<{ submitted: [] }>()

  const { t } = useLocaleText()
  const open = defineModel<boolean>('open', { required: true })
  const form = useTemplateRef<InstanceType<typeof Form>>('form')
  const values = reactive({ account: '' })
  const submitting = ref(false)

  watch(open, next => {
    if (!next) return
    form.value?.reset()
    values.account = props.initial ?? ''
  })

  async function onSubmit() {
    submitting.value = true
    try {
      await hikariRequest('/api/v3/user/me/lottery/prizes/{id}/account', {
        method: 'PUT',
        path: { id: props.winnerId },
        body: { account: values.account.trim() },
      })
      toast.success(t('lottery.account.submitted'))
      open.value = false
      emit('submitted')
    } catch (error) {
      form.value?.setErrors(getFieldErrors(error))
    } finally {
      submitting.value = false
    }
  }
</script>

<template>
  <Dialog
    v-model:open="open"
    :title="initial ? t('lottery.account.edit') : t('lottery.account.fill')"
    size="sm"
    :locked="submitting"
  >
    <template #content>
      <Text as="p" size="sm" tone="muted" class="mt-0! mb-4!">
        {{ t('lottery.prize.title', { tier: prize.tier, name: prize.name }) }}
      </Text>
      <Form
        ref="form"
        :values="values"
        :rules="claimAccountSchema"
        :disabled="submitting"
        @submit="onSubmit"
      >
        <FormField
          name="account"
          :label="prize.account_label ?? t('lottery.account.label')"
          required
          :description="t('lottery.account.hint')"
          description-placement="control"
        >
          <Input v-model="values.account" />
        </FormField>
      </Form>
    </template>
    <template #footer>
      <Button variant="ghost" tone="neutral" :disabled="submitting" @click="open = false">
        {{ t('common.cancel') }}
      </Button>
      <Button :loading="submitting" @click="form?.submit()">{{ t('common.submit') }}</Button>
    </template>
  </Dialog>
</template>
